import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { audio } from './audio';
import { CHARACTERS, HOVERBOARDS, OUTFITS } from './storage';
import { PlayerRig, PoliceDogRig, PoliceOfficerRig } from './three/characterRigs';
import { MaterialLibrary } from './three/materials';
import { LANES, WorldManager } from './three/worldBuilder';
import { CharacterDef, GameMode, GameSaveData, HoverboardDef, OutfitDef, PowerUpActiveState, WeatherType } from './types';

// Pre-allocated math objects to avoid GC per Three.js directives
const _v1 = new THREE.Vector3();
const _playerBox = new THREE.Box3();

export interface EngineCallbacks {
  onScoreUpdate: (state: {
    score: number;
    coins: number;
    diamonds: number;
    distance: number;
    multiplier: number;
    speed: number;
    powerUps: PowerUpActiveState;
    policeDistance: number;
    policeWarning: boolean;
    hasHoverboard: boolean;
  }) => void;
  onGameOver: (summary: {
    score: number;
    coins: number;
    diamonds: number;
    distance: number;
    highScore: boolean;
    reason: string;
  }) => void;
  onMissionProgress?: (type: string, amount: number) => void;
}

export class DashEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private isSoftwareGl = false;

  private clock = new THREE.Clock();
  private frameId = 0;
  private isRunning = false;
  private isPaused = false;

  // Scene Components
  public materials: MaterialLibrary;
  public worldManager: WorldManager;
  public playerRig: PlayerRig;
  public policeRig: PoliceOfficerRig;
  public dogRig: PoliceDogRig;

  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Player State
  private targetLane = 1; // 0=left (-3.4), 1=center (0), 2=right (3.4)
  private currentX = 0;
  private currentY = 0;
  private currentZ = 0;
  private velocityY = 0;
  private isGrounded = true;
  private currentGroundY = 0; // 0 or 3.6 on train roofs

  private isSliding = false;
  private slideTimer = 0;
  private isStumbling = false;
  private stumbleTimer = 0;
  private isInvulnerable = false;
  private invulnerableTimer = 0;

  // Movement Speed & Physics
  private baseSpeed = 22; // m/s
  private currentSpeed = 22;
  private maxSpeed = 38;
  private gravity = -42;
  private jumpForce = 15;

  // Police Chase Mechanics
  private policeDistance = 9; // meters behind player
  private targetPoliceDistance = 9;
  private policeWarning = false;
  private closeCallTimer = 0;

  // Active Power-ups
  public powerUps: PowerUpActiveState = {
    magnet: 0,
    superJump: 0,
    jetpack: 0,
    shield: 0,
    doubleCoins: 0,
    hoverboard: 0,
  };

  // Run Stats
  private runScore = 0;
  private runCoins = 0;
  private runDiamonds = 0;
  private runDistance = 0;
  private scoreMultiplier = 1;
  private timeAttackRemaining = 60; // for TIME_ATTACK mode

  // Customization handles
  private currentCharacter: CharacterDef;
  private currentOutfit: OutfitDef;
  private currentHoverboard: HoverboardDef;

  // Callbacks
  private callbacks: EngineCallbacks;
  private gameMode: GameMode = 'ENDLESS';

  // Weather & Themes
  private weatherList: WeatherType[] = ['DAY', 'SUNSET', 'NIGHT', 'RAIN'];
  private weatherIndex = 0;
  private distanceForNextWeather = 500;

  constructor(
    private container: HTMLElement,
    private saveData: GameSaveData,
    callbacks: EngineCallbacks,
    mode: GameMode = 'ENDLESS'
  ) {
    this.callbacks = callbacks;
    this.gameMode = mode;

    // Detect software GL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      180
    );
    this.camera.position.set(0, 4.2, 7.5);
    this.camera.lookAt(0, 1.8, -10);

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && this.saveData.settings.graphicsQuality !== 'LOW',
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, this.getQualityPixelRatio())
    );
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.saveData.settings.graphicsQuality !== 'LOW';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 1.2);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    this.dirLight.position.set(20, 35, 15);
    if (this.renderer.shadowMap.enabled) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 80;
      this.dirLight.shadow.camera.left = -15;
      this.dirLight.shadow.camera.right = 15;
      this.dirLight.shadow.camera.top = 25;
      this.dirLight.shadow.camera.bottom = -15;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    // 4. Materials & World
    this.materials = new MaterialLibrary();
    this.worldManager = new WorldManager(this.scene, this.materials, this.dirLight, this.hemiLight);

    // 5. Setup Character, Outfits & Hoverboard
    const charDef = CHARACTERS.find((c) => c.id === saveData.selectedCharacter) || CHARACTERS[0];
    this.currentCharacter = charDef;
    const outfitId = saveData.selectedOutfit[charDef.id] || `${charDef.id}_default`;
    this.currentOutfit = OUTFITS.find((o) => o.id === outfitId) || OUTFITS[0];
    this.currentHoverboard = HOVERBOARDS.find((h) => h.id === saveData.selectedHoverboard) || HOVERBOARDS[0];

    // Perk multiplier bonuses
    this.scoreMultiplier = 1 + (charDef.perkMultiplierBonus || 0);

    // 6. Spawn Rigs
    this.playerRig = new PlayerRig(this.currentCharacter, this.currentOutfit, this.currentHoverboard);
    this.scene.add(this.playerRig.group);

    this.policeRig = new PoliceOfficerRig();
    this.scene.add(this.policeRig.group);

    this.dogRig = new PoliceDogRig();
    this.scene.add(this.dogRig.group);

    // Check Nova auto-hoverboard perk
    if (charDef.id === 'nova') {
      this.activateHoverboard(10);
    }

    // Start Audio BGM
    audio.startBGM(1.0);

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // Start render loop
    this.isRunning = true;
    this.clock.start();
    this.loop();
  }

  private getQualityPixelRatio(): number {
    const q = this.saveData.settings.graphicsQuality;
    if (q === 'LOW') return 1;
    if (q === 'MEDIUM') return 1.25;
    if (q === 'HIGH') return 1.6;
    return 2.0; // ULTRA
  }

  public updateSettings(saveData: GameSaveData) {
    this.saveData = saveData;
    audio.setVolumes(
      saveData.settings.masterVolume,
      saveData.settings.musicVolume,
      saveData.settings.sfxVolume
    );
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, this.getQualityPixelRatio())
    );
  }

  // --- Controls & Input ---
  public moveLeft() {
    if (!this.isRunning || this.isPaused) return;
    if (this.targetLane > 0) {
      this.targetLane--;
      audio.playLaneSwitch();
    }
  }

  public moveRight() {
    if (!this.isRunning || this.isPaused) return;
    if (this.targetLane < 2) {
      this.targetLane++;
      audio.playLaneSwitch();
    }
  }

  public jump() {
    if (!this.isRunning || this.isPaused) return;
    if (this.isGrounded) {
      const superBoost = this.powerUps.superJump > 0 ? 1.45 : 1.0;
      this.velocityY = this.jumpForce * superBoost;
      this.isGrounded = false;
      this.isSliding = false;
      audio.playJump();
      this.callbacks.onMissionProgress?.('JUMPS', 1);
    }
  }

  public slide() {
    if (!this.isRunning || this.isPaused) return;
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.75;
      // If in air, perform fast dive drop!
      if (!this.isGrounded) {
        this.velocityY = -22;
      }
      audio.playSlide();
      this.callbacks.onMissionProgress?.('SLIDES', 1);
    }
  }

  public activateHoverboard(duration = 20) {
    if (this.saveData.hoverboardsStock > 0 || duration === 10) {
      if (duration === 20 && this.saveData.hoverboardsStock > 0) {
        this.saveData.hoverboardsStock--;
      }
      this.powerUps.hoverboard = duration;
      this.playerRig.setHoverboardVisible(true);
      audio.playHoverboard();
    }
  }

  public pause() {
    this.isPaused = true;
    audio.stopBGM();
  }

  public resume() {
    this.isPaused = false;
    audio.startBGM(this.currentSpeed / this.baseSpeed);
  }

  public revive() {
    // Revive after game over with invulnerability
    this.isPaused = false;
    this.isRunning = true;
    this.isStumbling = false;
    this.policeDistance = 10;
    this.targetPoliceDistance = 10;
    this.policeWarning = false;
    this.isInvulnerable = true;
    this.invulnerableTimer = 3.5;
    this.currentGroundY = 0;
    this.currentY = 0;
    this.isGrounded = true;
    this.activateHoverboard(8);
    audio.startBGM(this.currentSpeed / this.baseSpeed);
  }

  // --- Main Game Loop ---
  private loop = () => {
    if (!this.isRunning) return;

    if (this.isSoftwareGl) {
      this.afterDraw(this.loop);
    } else {
      this.frameId = requestAnimationFrame(this.loop);
    }

    if (this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsedTime = this.clock.getElapsedTime();

    this.updatePhysics(delta, elapsedTime);
    this.updatePolice(delta, elapsedTime);
    this.updatePowerUps(delta);
    this.updateCollectibles(delta);
    this.checkCollisions(delta);

    // Weather Progression
    if (this.runDistance >= this.distanceForNextWeather) {
      this.weatherIndex = (this.weatherIndex + 1) % this.weatherList.length;
      this.worldManager.setWeather(this.weatherList[this.weatherIndex]);
      this.distanceForNextWeather += 450;
    }

    // World & Chunks Update
    const difficulty = Math.min(1.0, this.runDistance / 2500);
    this.worldManager.update(this.currentZ, difficulty, delta);

    // Dynamic Camera Tracking
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.currentX * 0.7, 8, delta);
    this.camera.position.y = THREE.MathUtils.damp(
      this.camera.position.y,
      Math.max(3.8, this.currentY + 3.8),
      10,
      delta
    );
    this.camera.position.z = this.currentZ + 7.5;

    // Update DirLight target to follow player
    this.dirLight.position.z = this.currentZ + 15;
    this.dirLight.target.position.set(0, 0, this.currentZ - 10);
    this.dirLight.target.updateMatrixWorld();

    // Render Scene
    this.renderer.render(this.scene, this.camera);

    // Send HUD State Updates
    this.callbacks.onScoreUpdate({
      score: Math.floor(this.runScore),
      coins: this.runCoins,
      diamonds: this.runDiamonds,
      distance: Math.floor(this.runDistance),
      multiplier: this.scoreMultiplier,
      speed: Math.floor(this.currentSpeed),
      powerUps: this.powerUps,
      policeDistance: this.policeDistance,
      policeWarning: this.policeWarning,
      hasHoverboard: this.powerUps.hoverboard > 0,
    });
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  // --- Physics & Kinematics ---
  private updatePhysics(delta: number, time: number) {
    // Accelerate runner speed gradually
    if (this.currentSpeed < this.maxSpeed) {
      this.currentSpeed += delta * 0.2;
    }
    audio.updateBGMTempo(this.currentSpeed / this.baseSpeed);

    // Forward displacement
    const forwardStep = this.currentSpeed * delta;
    this.currentZ -= forwardStep;
    this.runDistance += forwardStep;
    this.runScore += forwardStep * this.scoreMultiplier * 2.5;

    // Time Attack mode timer countdown
    if (this.gameMode === 'TIME_ATTACK') {
      this.timeAttackRemaining -= delta;
      if (this.timeAttackRemaining <= 0) {
        this.triggerGameOver('Time Expired!');
        return;
      }
    }

    // Smooth Lane Interpolation (Exponential Damping)
    const targetX = LANES[this.targetLane];
    const prevX = this.currentX;
    this.currentX = THREE.MathUtils.damp(this.currentX, targetX, 16, delta);
    const laneOffsetRatio = (this.currentX - targetX) / 3.4;

    // Vertical Jump & Gravity
    if (!this.isGrounded) {
      this.velocityY += this.gravity * delta;
      this.currentY += this.velocityY * delta;

      if (this.currentY <= this.currentGroundY) {
        this.currentY = this.currentGroundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    // Slide timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Stumble timer
    if (this.isStumbling) {
      this.stumbleTimer -= delta;
      if (this.stumbleTimer <= 0) {
        this.isStumbling = false;
      }
    }

    // Invulnerability timer
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.playerRig.group.visible = true;
      } else {
        // Flash visibility
        this.playerRig.group.visible = Math.floor(time * 20) % 2 === 0;
      }
    }

    // Position Player Rig
    this.playerRig.group.position.set(this.currentX, this.currentY, this.currentZ);

    // Animation State
    let animState: 'RUN' | 'JUMP' | 'SLIDE' | 'HOVER' | 'STUMBLE' | 'BUSTED' = 'RUN';
    if (this.powerUps.hoverboard > 0) animState = 'HOVER';
    else if (!this.isGrounded) animState = 'JUMP';
    else if (this.isSliding) animState = 'SLIDE';
    else if (this.isStumbling) animState = 'STUMBLE';

    this.playerRig.animate(time, animState, this.currentSpeed / this.baseSpeed, laneOffsetRatio);
  }

  // --- Police Chase AI ---
  private updatePolice(delta: number, time: number) {
    // If player stumbled, police quickly surges close
    if (this.isStumbling) {
      this.targetPoliceDistance = 3.6; // right on heels!
      this.closeCallTimer = 5.0; // 5 seconds of warning tension
      this.policeWarning = true;
    } else if (this.closeCallTimer > 0) {
      this.closeCallTimer -= delta;
      this.targetPoliceDistance = 4.2;
      this.policeWarning = true;

      // Play urgent siren & dog bark pulses
      if (Math.random() < 0.04) audio.playPoliceSiren();
      if (Math.random() < 0.03) audio.playDogBark();
    } else {
      // Normal safe trailing distance
      this.targetPoliceDistance = 9.5;
      this.policeWarning = false;
    }

    // Smoothly approach target distance
    this.policeDistance = THREE.MathUtils.damp(
      this.policeDistance,
      this.targetPoliceDistance,
      2.5,
      delta
    );

    // Police officer follows slightly offset to the left of player's trail
    const policeZ = this.currentZ + this.policeDistance;
    const policeX = THREE.MathUtils.damp(
      this.policeRig.group.position.x,
      this.currentX - 0.7,
      5,
      delta
    );
    this.policeRig.group.position.set(policeX, this.currentGroundY, policeZ);
    this.policeRig.animate(time, this.currentSpeed / this.baseSpeed);

    // Police dog runs slightly to the right of officer
    const dogZ = this.currentZ + this.policeDistance + 0.6;
    const dogX = THREE.MathUtils.damp(
      this.dogRig.group.position.x,
      this.currentX + 0.8,
      6,
      delta
    );
    this.dogRig.group.position.set(dogX, this.currentGroundY, dogZ);
    this.dogRig.animate(time, this.currentSpeed / this.baseSpeed);
  }

  // --- Power-up Timers ---
  private updatePowerUps(delta: number) {
    if (this.powerUps.magnet > 0) this.powerUps.magnet = Math.max(0, this.powerUps.magnet - delta);
    if (this.powerUps.superJump > 0) this.powerUps.superJump = Math.max(0, this.powerUps.superJump - delta);
    if (this.powerUps.shield > 0) this.powerUps.shield = Math.max(0, this.powerUps.shield - delta);
    if (this.powerUps.doubleCoins > 0) this.powerUps.doubleCoins = Math.max(0, this.powerUps.doubleCoins - delta);

    if (this.powerUps.hoverboard > 0) {
      this.powerUps.hoverboard = Math.max(0, this.powerUps.hoverboard - delta);
      if (this.powerUps.hoverboard <= 0) {
        this.playerRig.setHoverboardVisible(false);
      }
    }
  }

  // --- Collectibles & Magnet Pull ---
  private updateCollectibles(delta: number) {
    const magnetRadius = (this.powerUps.magnet > 0) ? (14 * (1 + (this.currentCharacter.perkMagnetBonus || 0))) : 2.0;

    this.worldManager.chunks.forEach((chunk) => {
      chunk.collectibles.forEach((col) => {
        if (col.collected) return;

        // Distance to player
        const colZ = col.z;
        const colX = LANES[col.lane];
        const distZ = Math.abs(colZ - this.currentZ);
        const distX = Math.abs(colX - this.currentX);
        const distY = Math.abs(col.mesh.position.y - this.currentY);

        // Coin Magnet Pull towards player
        if (this.powerUps.magnet > 0 && distZ < magnetRadius && distZ > 0.5) {
          col.mesh.position.x = THREE.MathUtils.damp(col.mesh.position.x, this.currentX, 12, delta);
          col.mesh.position.y = THREE.MathUtils.damp(col.mesh.position.y, this.currentY + 1.0, 12, delta);
        }

        // Pickup collision
        if (distZ < 1.6 && distX < 1.3 && distY < 2.0) {
          col.collected = true;
          col.mesh.visible = false;

          if (col.type === 'COIN') {
            const coinVal = this.powerUps.doubleCoins > 0 ? 2 : 1;
            this.runCoins += coinVal;
            this.runScore += 50 * this.scoreMultiplier * coinVal;
            audio.playCoin();
            this.callbacks.onMissionProgress?.('COINS', coinVal);
          } else if (col.type === 'DIAMOND') {
            this.runDiamonds += 1;
            this.runScore += 250 * this.scoreMultiplier;
            audio.playDiamond();
          } else if (col.type === 'POWERUP_MAGNET') {
            this.powerUps.magnet = 15;
            audio.playPowerUp();
          } else if (col.type === 'POWERUP_2X') {
            this.powerUps.doubleCoins = 20;
            audio.playPowerUp();
          } else if (col.type === 'POWERUP_SHIELD') {
            this.powerUps.shield = 25;
            audio.playPowerUp();
          } else if (col.type === 'POWERUP_JUMP') {
            this.powerUps.superJump = 15;
            audio.playPowerUp();
          }
        }
      });
    });
  }

  // --- Obstacle Collision Detection ---
  private checkCollisions(delta: number) {
    if (this.isInvulnerable) return;

    // Player bounding box (slimmer when sliding)
    const playerHeight = this.isSliding ? 0.8 : 2.0;
    const playerCenterY = this.currentY + playerHeight / 2;
    _playerBox.setFromCenterAndSize(
      _v1.set(this.currentX, playerCenterY, this.currentZ),
      new THREE.Vector3(1.2, playerHeight, 1.4)
    );

    let onRoofOfTrain = false;

    for (const chunk of this.worldManager.chunks) {
      for (const obs of chunk.obstacles) {
        // Distance check first for performance
        if (Math.abs(obs.z - this.currentZ) > 12) continue;

        // Check if player is on top of train or ramp
        if (obs.canClimbRoof && obs.roofHeight) {
          const isOverTrainX = Math.abs(LANES[obs.lane] - this.currentX) < 1.5;
          const isOverTrainZ = Math.abs(obs.z - this.currentZ) < 8;

          if (isOverTrainX && isOverTrainZ && this.currentY >= obs.roofHeight - 0.4) {
            onRoofOfTrain = true;
            this.currentGroundY = obs.roofHeight;
            if (this.isGrounded) {
              this.currentY = obs.roofHeight;
            }
            continue;
          }
        }

        // Collision Check
        if (_playerBox.intersectsBox(obs.box)) {
          // If player has active hoverboard or shield, absorb crash!
          if (this.powerUps.hoverboard > 0) {
            this.powerUps.hoverboard = 0;
            this.playerRig.setHoverboardVisible(false);
            this.isInvulnerable = true;
            this.invulnerableTimer = 2.5;
            audio.playCollision();
            return;
          }

          if (this.powerUps.shield > 0) {
            this.powerUps.shield = 0;
            this.isInvulnerable = true;
            this.invulnerableTimer = 2.0;
            audio.playCollision();
            return;
          }

          // If police was already right on heels -> BUSTED!
          if (this.policeDistance < 4.5) {
            this.triggerGameOver('Busted by the Police Officer!');
            return;
          }

          // If head-on collision with moving train or large obstacle
          if (obs.type === 'TRAIN_MOVING' || obs.type === 'TRAIN_STATIONARY') {
            this.triggerGameOver('Crashed into a Metro Train!');
            return;
          }

          // Stumble on hurdle/barrier
          this.isStumbling = true;
          this.stumbleTimer = 2.0;
          this.currentSpeed = Math.max(14, this.currentSpeed * 0.7);
          audio.playCollision();
          audio.playDogBark();
          return;
        }
      }
    }

    // Reset ground level if not on train roof
    if (!onRoofOfTrain && this.currentGroundY > 0) {
      this.currentGroundY = 0;
      this.isGrounded = false; // Fall back to ground!
    }
  }

  private triggerGameOver(reason: string) {
    this.isRunning = false;
    this.playerRig.animate(0, 'BUSTED', 1.0);
    this.policeRig.animate(0, 1.0, true);
    audio.playCollision();
    audio.playPoliceSiren();

    const isNewHigh = this.runScore > this.saveData.highScore;

    this.callbacks.onGameOver({
      score: Math.floor(this.runScore),
      coins: this.runCoins,
      diamonds: this.runDiamonds,
      distance: Math.floor(this.runDistance),
      highScore: isNewHigh,
      reason,
    });
  }

  // --- Cleanup ---
  public destroy() {
    this.isRunning = false;
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    audio.stopBGM();

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
}
