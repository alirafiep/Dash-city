import * as THREE from 'three';
import { WeatherType } from '../types';
import { MaterialLibrary } from './materials';

export const LANE_WIDTH = 3.4;
export const LANES = [-LANE_WIDTH, 0, LANE_WIDTH] as const;
export const CHUNK_LENGTH = 60;
export const NUM_ACTIVE_CHUNKS = 6;

export interface ObstacleInstance {
  mesh: THREE.Group;
  lane: number; // 0, 1, 2
  z: number;
  type: 'JUMP_HURDLE' | 'SLIDE_BARRIER' | 'TRAIN_STATIONARY' | 'TRAIN_MOVING' | 'RAMP' | 'CARTOON_TRAIN_HOLLOW';
  box: THREE.Box3;
  passed?: boolean;
  canClimbRoof?: boolean;
  roofHeight?: number;
  speed?: number; // for moving trains
  isHollowCartoonTrain?: boolean;
  trainLength?: number;
  rearEntranceZ?: number;
  frontExitZ?: number;
  entered?: boolean;
}

export interface CollectibleInstance {
  mesh: THREE.Group;
  lane: number;
  z: number;
  y: number;
  type:
    | 'COIN'
    | 'DIAMOND'
    | 'DONUT'
    | 'POWERUP_MAGNET'
    | 'POWERUP_2X'
    | 'POWERUP_SHIELD'
    | 'POWERUP_JUMP'
    | 'POWERUP_SPEED'
    | 'POWERUP_PUNCH'
    | 'POWERUP_JETPACK';
  collected?: boolean;
  initialY: number;
}

export class WorldChunk {
  public group: THREE.Group;
  public baseZ = 0;
  public theme: 'CITY' | 'RAIL' | 'TUNNEL' | 'BRIDGE' | 'PARK' = 'CITY';
  public obstacles: ObstacleInstance[] = [];
  public collectibles: CollectibleInstance[] = [];

  constructor(public id: number, private materials: MaterialLibrary) {
    this.group = new THREE.Group();
    this.group.name = `WorldChunk_${id}`;
  }

  public generate(
    startZ: number,
    theme: 'CITY' | 'RAIL' | 'TUNNEL' | 'BRIDGE' | 'PARK',
    difficulty: number
  ) {
    this.baseZ = startZ;
    this.theme = theme;
    this.group.position.z = startZ;

    // Clear old children
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
    }
    this.obstacles = [];
    this.collectibles = [];

    // 1. Build Ground & Tracks
    this.buildTracks();

    // 2. Build Themed Surroundings
    if (theme === 'CITY') this.buildCitySurroundings();
    else if (theme === 'TUNNEL') this.buildTunnelSurroundings();
    else if (theme === 'BRIDGE') this.buildBridgeSurroundings();
    else if (theme === 'PARK') this.buildParkSurroundings();
    else this.buildRailYardSurroundings();

    // 3. Populate Obstacles & Moving Trains
    this.populateObstacles(difficulty);

    // 4. Populate Collectibles (Coins, Diamonds, Power-ups)
    this.populateCollectibles();
  }

  private buildTracks() {
    // Ground plane (Asphalt)
    const groundGeo = new THREE.PlaneGeometry(16, CHUNK_LENGTH);
    const ground = new THREE.Mesh(groundGeo, this.materials.asphaltMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -CHUNK_LENGTH / 2);
    ground.receiveShadow = true;
    this.group.add(ground);

    // 3 Railway Tracks (Steel rails + wooden ties)
    LANES.forEach((laneX) => {
      // Left and right steel rails
      const railGeo = new THREE.BoxGeometry(0.1, 0.12, CHUNK_LENGTH);
      const railL = new THREE.Mesh(railGeo, this.materials.railSteelMaterial);
      railL.position.set(laneX - 0.7, 0.06, -CHUNK_LENGTH / 2);
      railL.receiveShadow = true;

      const railR = new THREE.Mesh(railGeo, this.materials.railSteelMaterial);
      railR.position.set(laneX + 0.7, 0.06, -CHUNK_LENGTH / 2);
      railR.receiveShadow = true;

      this.group.add(railL, railR);

      // Wooden cross ties
      const sleeperGeo = new THREE.BoxGeometry(1.8, 0.06, 0.28);
      for (let z = -4; z >= -CHUNK_LENGTH + 4; z -= 3) {
        const sleeper = new THREE.Mesh(sleeperGeo, this.materials.woodSleeperMaterial);
        sleeper.position.set(laneX, 0.03, z);
        sleeper.receiveShadow = true;
        this.group.add(sleeper);
      }
    });
  }

  private buildCitySurroundings() {
    // Left & Right Skyscrapers with windows
    const buildingColors = [0x1e293b, 0x0f172a, 0x1e1b4b, 0x312e81];

    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const h = 25 + Math.random() * 30;
        const w = 12 + Math.random() * 6;
        const d = 12;
        const bGeo = new THREE.BoxGeometry(w, h, d);
        const bMat = new THREE.MeshStandardMaterial({
          color: buildingColors[i % buildingColors.length],
          roughness: 0.6,
          metalness: 0.3,
        });
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(side * (14 + w / 2), h / 2, -i * 15 - 7);
        building.castShadow = true;
        this.group.add(building);

        // Neon Sign on building
        if (i % 2 === 0) {
          const signGeo = new THREE.PlaneGeometry(8, 2.5);
          const signMat = new THREE.MeshBasicMaterial({
            color: side < 0 ? 0x06b6d4 : 0xec4899,
            side: THREE.DoubleSide,
          });
          const sign = new THREE.Mesh(signGeo, signMat);
          sign.position.set(side * (13.9), 12 + Math.random() * 8, -i * 15 - 7);
          sign.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
          this.group.add(sign);
        }
      }

      // Street Lamps
      for (let z = -10; z >= -50; z -= 20) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.1, 5, 8),
          this.materials.railSteelMaterial
        );
        post.position.set(side * 6.8, 2.5, z);
        this.group.add(post);

        const lightBulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          this.materials.neonGlowMaterial
        );
        lightBulb.position.set(side * 6.8, 5, z);
        this.group.add(lightBulb);
      }
    }
  }

  private buildTunnelSurroundings() {
    // Curved concrete arch tunnel with pulsating neon rings
    const archCount = 6;
    for (let i = 0; i < archCount; i++) {
      const z = -i * 10 - 5;
      const ringGroup = new THREE.Group();
      ringGroup.position.set(0, 0, z);

      // Left column
      const colGeo = new THREE.BoxGeometry(1.2, 7, 1.2);
      const lCol = new THREE.Mesh(colGeo, this.materials.barrierConcreteMaterial);
      lCol.position.set(-6.8, 3.5, 0);

      // Right column
      const rCol = new THREE.Mesh(colGeo, this.materials.barrierConcreteMaterial);
      rCol.position.set(6.8, 3.5, 0);

      // Overhead beam
      const beamGeo = new THREE.BoxGeometry(14.8, 1.2, 1.2);
      const beam = new THREE.Mesh(beamGeo, this.materials.barrierConcreteMaterial);
      beam.position.set(0, 7.6, 0);

      // Neon strip across arch
      const neonGeo = new THREE.BoxGeometry(14, 0.2, 0.3);
      const neonMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const neonStrip = new THREE.Mesh(neonGeo, neonMat);
      neonStrip.position.set(0, 7.1, 0);

      ringGroup.add(lCol, rCol, beam, neonStrip);
      this.group.add(ringGroup);
    }
  }

  private buildBridgeSurroundings() {
    // Water below
    const waterGeo = new THREE.PlaneGeometry(80, CHUNK_LENGTH);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -6, -CHUNK_LENGTH / 2);
    this.group.add(water);

    // Bridge Guardrails and Suspension Towers
    for (let side = -1; side <= 1; side += 2) {
      // Guardrail
      const railGeo = new THREE.BoxGeometry(0.3, 1.2, CHUNK_LENGTH);
      const rail = new THREE.Mesh(railGeo, this.materials.hazardMaterial);
      rail.position.set(side * 6.5, 0.6, -CHUNK_LENGTH / 2);
      this.group.add(rail);

      // Main Suspension Tower
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 24, 1.5),
        this.materials.railSteelMaterial
      );
      tower.position.set(side * 7.5, 6, -CHUNK_LENGTH / 2);
      this.group.add(tower);
    }
  }

  private buildParkSurroundings() {
    // Grass borders
    for (let side = -1; side <= 1; side += 2) {
      const grassGeo = new THREE.PlaneGeometry(16, CHUNK_LENGTH);
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.rotation.x = -Math.PI / 2;
      grass.position.set(side * 14, 0.01, -CHUNK_LENGTH / 2);
      this.group.add(grass);

      // Low poly stylized park trees
      for (let z = -6; z >= -54; z -= 12) {
        const tree = new THREE.Group();
        tree.position.set(side * (8.5 + Math.random() * 4), 0, z);

        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 3, 6),
          this.materials.woodSleeperMaterial
        );
        trunk.position.y = 1.5;
        trunk.castShadow = true;

        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry(1.8, 4.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 })
        );
        foliage.position.y = 4.2;
        foliage.castShadow = true;

        tree.add(trunk, foliage);
        this.group.add(tree);
      }
    }
  }

  private buildRailYardSurroundings() {
    // Overhead catenary steel gantries
    for (let z = -15; z >= -55; z -= 30) {
      const gantry = new THREE.Group();
      gantry.position.set(0, 0, z);

      const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 6.5, 8), this.materials.railSteelMaterial);
      pL.position.set(-6.5, 3.25, 0);
      const pR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 6.5, 8), this.materials.railSteelMaterial);
      pR.position.set(6.5, 3.25, 0);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.3, 0.3), this.materials.railSteelMaterial);
      beam.position.set(0, 6.5, 0);

      // Overhead wire insulators
      LANES.forEach((lx) => {
        const dropWire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8), this.materials.railSteelMaterial);
        dropWire.position.set(lx, 5.6, 0);
        gantry.add(dropWire);
      });

      gantry.add(pL, pR, beam);
      this.group.add(gantry);
    }
  }

  private populateObstacles(difficulty: number) {
    // Determine obstacle pattern for this chunk
    // 3 lanes (0, 1, 2)
    const patternZ1 = -18;
    const patternZ2 = -42;

    const spawnObstacleAt = (laneIdx: number, localZ: number, allowTrain = true) => {
      const laneX = LANES[laneIdx];
      const roll = Math.random();

      if (allowTrain && (roll < 0.38 + difficulty * 0.12)) {
        // Spawn Train (prefer hollow cartoon train with open rear entrance!)
        const isHollow = Math.random() < 0.75;
        const isMoving = Math.random() < (0.35 + difficulty * 0.15);

        if (isHollow) {
          const train = this.createCartoonHollowTrainMesh(isMoving);
          train.position.set(laneX, 0, localZ);
          this.group.add(train);

          const trainLen = 18;
          const box = new THREE.Box3();
          box.setFromCenterAndSize(
            new THREE.Vector3(laneX, 1.9, this.baseZ + localZ),
            new THREE.Vector3(2.7, 3.8, trainLen)
          );

          this.obstacles.push({
            mesh: train,
            lane: laneIdx,
            z: this.baseZ + localZ,
            type: 'CARTOON_TRAIN_HOLLOW',
            box,
            canClimbRoof: true,
            roofHeight: 3.8,
            speed: isMoving ? (7 + difficulty * 3) : 0,
            isHollowCartoonTrain: true,
            trainLength: trainLen,
            rearEntranceZ: this.baseZ + localZ + trainLen / 2,
            frontExitZ: this.baseZ + localZ - trainLen / 2,
          });

          // Interior collectibles: 2 Strawberry Frosted Donuts & 3 Golden Coins
          [-4, 4].forEach((iz) => {
            this.addDonut(laneIdx, laneX, localZ + iz, 1.25);
          });
          [-2, 0, 2].forEach((iz) => {
            this.addCoin(laneIdx, laneX, localZ + iz, 1.25);
          });
        } else {
          const train = this.createTrainMesh(isMoving);
          train.position.set(laneX, 0, localZ);
          this.group.add(train);

          const trainLen = 14;
          const box = new THREE.Box3();
          box.setFromCenterAndSize(
            new THREE.Vector3(laneX, 1.8, this.baseZ + localZ),
            new THREE.Vector3(2.6, 3.6, trainLen)
          );

          this.obstacles.push({
            mesh: train,
            lane: laneIdx,
            z: this.baseZ + localZ,
            type: isMoving ? 'TRAIN_MOVING' : 'TRAIN_STATIONARY',
            box,
            canClimbRoof: true,
            roofHeight: 3.6,
            speed: isMoving ? (8 + difficulty * 4) : 0,
          });

          // If stationary train, add a climbable ramp at the rear so player can run up!
          if (!isMoving && Math.random() < 0.6) {
            const ramp = this.createRampMesh();
            ramp.position.set(laneX, 0, localZ + trainLen / 2 + 3);
            this.group.add(ramp);

            const rampBox = new THREE.Box3().setFromCenterAndSize(
              new THREE.Vector3(laneX, 1.5, this.baseZ + localZ + trainLen / 2 + 3),
              new THREE.Vector3(2.4, 3, 6)
            );
            this.obstacles.push({
              mesh: ramp,
              lane: laneIdx,
              z: this.baseZ + localZ + trainLen / 2 + 3,
              type: 'RAMP',
              box: rampBox,
              canClimbRoof: true,
              roofHeight: 3.6,
            });
          }
        }
      } else if (roll < 0.7) {
        // Low Jump Hurdle (must jump)
        const hurdle = this.createJumpHurdleMesh();
        hurdle.position.set(laneX, 0, localZ);
        this.group.add(hurdle);

        const box = new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(laneX, 0.6, this.baseZ + localZ),
          new THREE.Vector3(2.6, 1.2, 0.6)
        );
        this.obstacles.push({
          mesh: hurdle,
          lane: laneIdx,
          z: this.baseZ + localZ,
          type: 'JUMP_HURDLE',
          box,
        });
      } else {
        // High Slide Barrier (must slide)
        const barrier = this.createSlideBarrierMesh();
        barrier.position.set(laneX, 0, localZ);
        this.group.add(barrier);

        const box = new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(laneX, 2.3, this.baseZ + localZ),
          new THREE.Vector3(2.8, 1.8, 0.6)
        );
        this.obstacles.push({
          mesh: barrier,
          lane: laneIdx,
          z: this.baseZ + localZ,
          type: 'SLIDE_BARRIER',
          box,
        });
      }
    };

    // Pattern 1: One or two obstacles at Z1 (never block all 3 lanes!)
    const lanesAvailable1 = [0, 1, 2];
    const numObstacles1 = Math.random() < (0.4 + difficulty * 0.3) ? 2 : 1;
    for (let k = 0; k < numObstacles1; k++) {
      const idx = Math.floor(Math.random() * lanesAvailable1.length);
      const lane = lanesAvailable1.splice(idx, 1)[0];
      spawnObstacleAt(lane, patternZ1, true);
    }

    // Pattern 2: One or two obstacles at Z2
    const lanesAvailable2 = [0, 1, 2];
    const numObstacles2 = Math.random() < (0.5 + difficulty * 0.3) ? 2 : 1;
    for (let k = 0; k < numObstacles2; k++) {
      const idx = Math.floor(Math.random() * lanesAvailable2.length);
      const lane = lanesAvailable2.splice(idx, 1)[0];
      spawnObstacleAt(lane, patternZ2, true);
    }
  }

  private createTrainMesh(isMoving: boolean): THREE.Group {
    const train = new THREE.Group();
    const length = 14;
    const height = 3.6;
    const width = 2.6;

    // Body
    const bodyMat = isMoving ? this.materials.trainRedMaterial : this.materials.trainBlueMaterial;
    const bodyGeo = new THREE.BoxGeometry(width, height - 0.6, length);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = (height - 0.6) / 2 + 0.6;
    body.castShadow = true;
    body.receiveShadow = true;
    train.add(body);

    // Roof walkway (with guardrails where player can surf!)
    const roofGeo = new THREE.BoxGeometry(width - 0.2, 0.1, length);
    const roofMat = this.materials.railSteelMaterial;
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height;
    train.add(roof);

    // Front Cab Windshield
    const cabGeo = new THREE.BoxGeometry(width - 0.4, 1.2, 0.4);
    const cabMat = this.materials.buildingGlassMaterial;
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, height - 1.2, length / 2 + 0.1);
    train.add(cab);

    // Side & Rear Climbing Ladders / Grab Handles
    // Left & right ladders allow smooth climbing onto roof from either side!
    const ladderMat = this.materials.hazardMaterial;
    const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6);
    rungGeo.rotateZ(Math.PI / 2);

    // Left and Right Ladders
    [-1, 1].forEach((side) => {
      const ladderX = side * (width / 2 + 0.04);
      // Place ladders at mid and rear sections of train
      [-3.5, 3.5].forEach((ladderZ) => {
        // Vertical side rails
        const railGeo = new THREE.CylinderGeometry(0.03, 0.03, height, 6);
        const rail1 = new THREE.Mesh(railGeo, this.materials.railSteelMaterial);
        rail1.position.set(ladderX, height / 2, ladderZ - 0.35);
        const rail2 = rail1.clone();
        rail2.position.z = ladderZ + 0.35;
        train.add(rail1, rail2);

        // Horizontal rungs from ground up to roof
        for (let y = 0.6; y <= height; y += 0.5) {
          const rung = new THREE.Mesh(rungGeo, ladderMat);
          rung.position.set(ladderX, y, ladderZ);
          train.add(rung);
        }

        // Top grab handle arched over the roof
        const handleGeo = new THREE.BoxGeometry(0.12, 0.25, 0.8);
        const handle = new THREE.Mesh(handleGeo, this.materials.hazardMaterial);
        handle.position.set(ladderX, height + 0.12, ladderZ);
        train.add(handle);
      });
    });

    // Rear End Climbing Ladder
    const rearZ = -length / 2 - 0.04;
    for (let y = 0.6; y <= height; y += 0.5) {
      const rearRung = new THREE.Mesh(rungGeo, ladderMat);
      rearRung.position.set(0, y, rearZ);
      train.add(rearRung);
    }

    // Lock train rotation strictly - train is 100% rigid and will never tilt, shake or derail
    train.rotation.set(0, 0, 0);

    return train;
  }

  private createCartoonHollowTrainMesh(isMoving: boolean): THREE.Group {
    const train = new THREE.Group();
    const length = 18;
    const height = 3.8;
    const width = 2.7;

    // 1. Carriage Floor (smooth hollow walkway for skateboard)
    const floorGeo = new THREE.BoxGeometry(width - 0.2, 0.25, length);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Slate rubber flooring
      roughness: 0.7,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.25;
    floor.receiveShadow = true;
    train.add(floor);

    // 2. Carriage Roof (walkway on top too!)
    const roofGeo = new THREE.BoxGeometry(width - 0.1, 0.2, length);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cartoon cyan roof
      roughness: 0.4,
      metalness: 0.3,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height;
    roof.castShadow = true;
    train.add(roof);

    // Roof Guardrails
    [-1, 1].forEach((side) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.3, length),
        this.materials.railSteelMaterial
      );
      rail.position.set(side * (width / 2 - 0.15), height + 0.2, 0);
      train.add(rail);
    });

    // 3. Left and Right Cartoon Walls with Windows
    const bodyMat = isMoving ? this.materials.trainRedMaterial : this.materials.trainBlueMaterial;
    [-1, 1].forEach((side) => {
      const wallX = side * (width / 2 - 0.08);

      // Lower wall panel
      const lowerWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.2, length), bodyMat);
      lowerWall.position.set(wallX, 0.85, 0);
      lowerWall.castShadow = true;
      train.add(lowerWall);

      // Upper wall beam
      const upperWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, length), bodyMat);
      upperWall.position.set(wallX, height - 0.3, 0);
      upperWall.castShadow = true;
      train.add(upperWall);

      // Vertical Window Pillars & Windows
      const windowGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.85,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      });

      for (let wz = -6; wz <= 6; wz += 3) {
        // Window Pillar
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.8, 0.4), bodyMat);
        pillar.position.set(wallX, 2.3, wz);
        train.add(pillar);

        // Window Glass Pane
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 2.4), windowGlassMat);
        glass.position.set(wallX, 2.3, wz + 1.5);
        train.add(glass);
      }
    });

    // 4. Interior Seats & Grab Handles
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    for (let sz = -5; sz <= 5; sz += 2.5) {
      [-1, 1].forEach((side) => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 1.6), seatMat);
        seat.position.set(side * 0.95, 0.55, sz);
        train.add(seat);
      });
    }

    // Interior Warm Yellow Lighting Tubes
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-4, 0, 4].forEach((lz) => {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), lightMat);
      lamp.rotation.z = Math.PI / 2;
      lamp.position.set(0, height - 0.25, lz);
      train.add(lamp);
    });

    // 5. WIDE OPEN REAR ENTRANCE (At z = +length / 2)
    // Clear opening for the skateboard to enter!
    const rearZ = length / 2;

    // Glowing Neon Portal Arch around Rear Doorway
    const neonGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.25, 0.3), neonGreenMat);
    archTop.position.set(0, height - 0.15, rearZ);
    train.add(archTop);

    [-1, 1].forEach((side) => {
      const archPillar = new THREE.Mesh(new THREE.BoxGeometry(0.25, height - 0.5, 0.3), neonGreenMat);
      archPillar.position.set(side * (width / 2 - 0.2), (height - 0.5) / 2 + 0.25, rearZ);
      train.add(archPillar);

      // Flashing Hazard Lantern
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      lantern.position.set(side * (width / 2 + 0.1), height - 0.6, rearZ);
      train.add(lantern);
    });

    // Rear Entrance Sign: "CARTOON TRAIN - ENTER REAR"
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.45, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    signBoard.position.set(0, height + 0.35, rearZ);
    train.add(signBoard);

    // Glowing Downward Chevron Arrow (Points right into the rear doorway!)
    const arrowGeo = new THREE.ConeGeometry(0.25, 0.4, 4);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.z = Math.PI; // Points downward into door
    arrow.position.set(0, height - 0.45, rearZ + 0.1);
    train.add(arrow);

    // Skateboard Roll-in Ramp at Rear Threshold (seamless smooth transition onto floor)
    const rampMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.4, 0.12, 1.2),
      this.materials.hazardMaterial
    );
    rampMesh.position.set(0, 0.14, rearZ + 0.5);
    rampMesh.rotation.x = -0.15; // Slopes up into the train floor!
    train.add(rampMesh);

    // 6. FRONT CAB (Closed to outside with cartoon face & smokestack)
    const frontZ = -length / 2;

    // Heavy Steel Cowcatcher Bumper
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.8, 0.6),
      this.materials.hazardMaterial
    );
    bumper.position.set(0, 0.5, frontZ - 0.2);
    bumper.castShadow = true;
    train.add(bumper);

    // Front Nose / Face
    const noseGeo = new THREE.BoxGeometry(width - 0.2, height - 1.0, 0.6);
    const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
    noseMesh.position.set(0, (height - 1.0) / 2 + 0.8, frontZ - 0.2);
    train.add(noseMesh);

    // Cute Expressive Cartoon Train Eyes on Front Cab!
    const eyeWhiteGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    [-0.65, 0.65].forEach((x) => {
      const eye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      eye.position.set(x, 2.6, frontZ - 0.52);
      const pupil = new THREE.Mesh(eyePupilGeo, eyePupilMat);
      pupil.position.set(0, 0, 0.2);
      eye.add(pupil);
      train.add(eye);
    });

    // Cartoon Steam Smokestack on Front Roof
    const stackGeo = new THREE.CylinderGeometry(0.3, 0.2, 1.2, 12);
    const stackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const stack = new THREE.Mesh(stackGeo, stackMat);
    stack.position.set(0, height + 0.6, frontZ + 1.6);
    train.add(stack);

    // Cartoon Puffy Smoke Clouds
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    [1.3, 1.9, 2.6].forEach((y, i) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.28 + i * 0.12, 8, 8), cloudMat);
      puff.position.set(0.05 * i, height + y, frontZ + 1.6 + i * 0.4);
      train.add(puff);
    });

    // Front Exit Doorway Ramp (smooth launch out onto tracks)
    const exitRamp = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.4, 0.15, 1.4),
      this.materials.hazardMaterial
    );
    exitRamp.position.set(0, 0.14, frontZ - 0.6);
    exitRamp.rotation.x = 0.18; // Slopes down to rails
    train.add(exitRamp);

    // Strict zero-tilt balance
    train.rotation.set(0, 0, 0);

    return train;
  }

  private createRampMesh(): THREE.Group {
    const ramp = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(-3, 0);
    shape.lineTo(3, 3.6);
    shape.lineTo(3, 0);
    shape.closePath();

    const extrudeSettings = { depth: 2.4, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    const mesh = new THREE.Mesh(geo, this.materials.hazardMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.y = 1.8;
    mesh.castShadow = true;
    ramp.add(mesh);
    return ramp;
  }

  private createJumpHurdleMesh(): THREE.Group {
    const hurdle = new THREE.Group();
    // Two concrete posts and a hazard crossbar
    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.0, 8);
    const pL = new THREE.Mesh(postGeo, this.materials.railSteelMaterial);
    pL.position.set(-1.1, 0.5, 0);
    pL.castShadow = true;

    const pR = new THREE.Mesh(postGeo, this.materials.railSteelMaterial);
    pR.position.set(1.1, 0.5, 0);
    pR.castShadow = true;

    const barGeo = new THREE.BoxGeometry(2.5, 0.3, 0.15);
    const bar = new THREE.Mesh(barGeo, this.materials.hazardMaterial);
    bar.position.set(0, 0.75, 0);
    bar.castShadow = true;

    hurdle.add(pL, pR, bar);
    return hurdle;
  }

  private createSlideBarrierMesh(): THREE.Group {
    const barrier = new THREE.Group();
    // High overhead sign or gate that requires sliding under
    const postGeo = new THREE.CylinderGeometry(0.1, 0.12, 3.8, 8);
    const pL = new THREE.Mesh(postGeo, this.materials.railSteelMaterial);
    pL.position.set(-1.3, 1.9, 0);
    pL.castShadow = true;

    const pR = new THREE.Mesh(postGeo, this.materials.railSteelMaterial);
    pR.position.set(1.3, 1.9, 0);
    pR.castShadow = true;

    // Overhead sign (clearing height is ~1.3m, sign spans 1.3m to 3.2m)
    const signGeo = new THREE.BoxGeometry(2.8, 1.8, 0.25);
    const sign = new THREE.Mesh(signGeo, this.materials.hazardMaterial);
    sign.position.set(0, 2.3, 0);
    sign.castShadow = true;

    barrier.add(pL, pR, sign);
    return barrier;
  }

  private populateCollectibles() {
    // Generate trails of coins along lanes
    LANES.forEach((laneX, laneIdx) => {
      // Check if this lane has obstacles
      const hasObstacleNear = (z: number) => {
        return this.obstacles.some(
          (obs) => obs.lane === laneIdx && Math.abs(obs.z - (this.baseZ + z)) < 8
        );
      };

      // Arc of coins for jump timing
      if (Math.random() < 0.4) {
        const centerZ = -30;
        if (!hasObstacleNear(centerZ)) {
          for (let i = -3; i <= 3; i++) {
            const z = centerZ + i * 2;
            const arcY = 0.8 + (1 - Math.abs(i) / 3) * 2.2;
            this.addCoin(laneIdx, laneX, z, arcY);
          }
        }
      } else {
        // Straight line of coins
        const startZ = -8;
        if (!hasObstacleNear(startZ - 10)) {
          for (let z = startZ; z >= startZ - 14; z -= 2.2) {
            this.addCoin(laneIdx, laneX, z, 0.8);
          }
        }
      }

      // Rare Blue Diamonds
      if (Math.random() < 0.18) {
        const dZ = -25 - Math.random() * 20;
        if (!hasObstacleNear(dZ)) {
          this.addDiamond(laneIdx, laneX, dZ, 1.2);
        }
      }

      // Occasional Power-up box
      if (Math.random() < 0.22) {
        const pZ = -35;
        if (!hasObstacleNear(pZ)) {
          const powerTypes: Array<CollectibleInstance['type']> = [
            'POWERUP_MAGNET',
            'POWERUP_2X',
            'POWERUP_SHIELD',
            'POWERUP_JUMP',
            'POWERUP_SPEED',
            'POWERUP_PUNCH',
            'POWERUP_JETPACK',
          ];
          const chosen = powerTypes[Math.floor(Math.random() * powerTypes.length)];
          this.addPowerUpToken(laneIdx, laneX, pZ, chosen);
        }
      }

      // High-altitude Sky Coins (for Jetpack flight!)
      for (let sz = -10; sz >= -50; sz -= 6) {
        this.addCoin(laneIdx, laneX, sz, 7.5);
      }
    });
  }

  private addCoin(laneIdx: number, x: number, z: number, y: number) {
    const coinGroup = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    const mesh = new THREE.Mesh(geo, this.materials.coinMaterial);
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    coinGroup.add(mesh);
    coinGroup.position.set(x, y, z);
    this.group.add(coinGroup);

    this.collectibles.push({
      mesh: coinGroup,
      lane: laneIdx,
      z: this.baseZ + z,
      y,
      type: 'COIN',
      initialY: y,
    });
  }

  private addDiamond(laneIdx: number, x: number, z: number, y: number) {
    const dGroup = new THREE.Group();
    const geo = new THREE.OctahedronGeometry(0.4, 0);
    const mesh = new THREE.Mesh(geo, this.materials.diamondMaterial);
    mesh.castShadow = true;
    dGroup.add(mesh);
    dGroup.position.set(x, y, z);
    this.group.add(dGroup);

    this.collectibles.push({
      mesh: dGroup,
      lane: laneIdx,
      z: this.baseZ + z,
      y,
      type: 'DIAMOND',
      initialY: y,
    });
  }

  public addDonut(laneIdx: number, x: number, z: number, y: number) {
    const donutGroup = new THREE.Group();

    // Dough ring
    const doughGeo = new THREE.TorusGeometry(0.32, 0.14, 12, 18);
    const doughMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const dough = new THREE.Mesh(doughGeo, doughMat);
    donutGroup.add(dough);

    // Strawberry Glaze
    const frostGeo = new THREE.TorusGeometry(0.33, 0.11, 12, 18);
    const frostMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.2,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.3,
    });
    const frosting = new THREE.Mesh(frostGeo, frostMat);
    frosting.position.y = 0.04;
    donutGroup.add(frosting);

    // Rainbow Sprinkles
    const sprinkleColors = [0xfacc15, 0x38bdf8, 0x22c55e, 0xffffff];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const sp = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.03, 0.03),
        new THREE.MeshBasicMaterial({ color: sprinkleColors[i % sprinkleColors.length] })
      );
      sp.position.set(Math.cos(angle) * 0.32, 0.14, Math.sin(angle) * 0.32);
      sp.rotation.y = angle;
      donutGroup.add(sp);
    }

    donutGroup.position.set(x, y, z);
    this.group.add(donutGroup);

    this.collectibles.push({
      mesh: donutGroup,
      lane: laneIdx,
      z: this.baseZ + z,
      y,
      type: 'DONUT',
      initialY: y,
    });
  }

  private addPowerUpToken(
    laneIdx: number,
    x: number,
    z: number,
    type: CollectibleInstance['type']
  ) {
    const group = new THREE.Group();
    let color = 0xef4444;
    let label = '⚡';

    if (type === 'POWERUP_MAGNET') { color = 0xec4899; label = '🧲'; }
    else if (type === 'POWERUP_2X') { color = 0x3b82f6; label = '2X'; }
    else if (type === 'POWERUP_SHIELD') { color = 0x10b981; label = '🛡️'; }
    else if (type === 'POWERUP_JUMP') { color = 0xf59e0b; label = '👟'; }
    else if (type === 'POWERUP_SPEED') { color = 0x06b6d4; label = '⚡'; }
    else if (type === 'POWERUP_PUNCH') { color = 0xf97316; label = '🥊'; }
    else if (type === 'POWERUP_JETPACK') { color = 0x8b5cf6; label = '🚀'; }

    const boxGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const boxMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.15,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = true;
    group.add(box);

    // Outer rotating glowing crystal ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.05, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    group.position.set(x, 1.25, z);
    this.group.add(group);

    this.collectibles.push({
      mesh: group,
      lane: laneIdx,
      z: this.baseZ + z,
      y: 1.25,
      type,
      initialY: 1.25,
    });
  }
}

/**
 * World Environment Controller
 * Manages chunk looping, weather particles, and lighting
 */
export class WorldManager {
  public chunks: WorldChunk[] = [];
  public currentTheme: WorldChunk['theme'] = 'CITY';
  private chunkIndex = 0;
  private weatherType: WeatherType = 'DAY';

  // Rain Particles
  public rainSystem: THREE.Points | null = null;
  private rainCount = 1200;

  constructor(
    public scene: THREE.Scene,
    public materials: MaterialLibrary,
    public dirLight: THREE.DirectionalLight,
    public hemiLight: THREE.HemisphereLight
  ) {
    this.initChunks();
    this.initRain();
    this.setWeather('DAY');
  }

  private initChunks() {
    for (let i = 0; i < NUM_ACTIVE_CHUNKS; i++) {
      const chunk = new WorldChunk(i, this.materials);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
      const theme = i === 0 ? 'CITY' : this.pickNextTheme();
      chunk.generate(-i * CHUNK_LENGTH, theme, 0.1);
      this.chunkIndex++;
    }
  }

  private initRain() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = -Math.random() * 90;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.6,
    });
    this.rainSystem = new THREE.Points(geo, mat);
    this.rainSystem.visible = false;
    this.scene.add(this.rainSystem);
  }

  public setWeather(weather: WeatherType) {
    this.weatherType = weather;
    if (weather === 'DAY') {
      this.scene.background = new THREE.Color(0x38bdf8); // Sky blue
      this.scene.fog = new THREE.Fog(0x38bdf8, 35, 120);
      this.dirLight.color.setHex(0xfff7ed);
      this.dirLight.intensity = 2.4;
      this.hemiLight.color.setHex(0xbae6fd);
      this.hemiLight.groundColor.setHex(0x1e293b);
      if (this.rainSystem) this.rainSystem.visible = false;
    } else if (weather === 'SUNSET') {
      this.scene.background = new THREE.Color(0xf97316); // Golden orange
      this.scene.fog = new THREE.Fog(0xf97316, 30, 110);
      this.dirLight.color.setHex(0xfde047);
      this.dirLight.intensity = 2.6;
      this.hemiLight.color.setHex(0xfb923c);
      this.hemiLight.groundColor.setHex(0x451a03);
      if (this.rainSystem) this.rainSystem.visible = false;
    } else if (weather === 'NIGHT') {
      this.scene.background = new THREE.Color(0x090d16); // Midnight cyber
      this.scene.fog = new THREE.Fog(0x090d16, 25, 95);
      this.dirLight.color.setHex(0x818cf8);
      this.dirLight.intensity = 1.2;
      this.hemiLight.color.setHex(0x4338ca);
      this.hemiLight.groundColor.setHex(0x020617);
      if (this.rainSystem) this.rainSystem.visible = false;
    } else if (weather === 'RAIN') {
      this.scene.background = new THREE.Color(0x1e293b); // Overcast slate
      this.scene.fog = new THREE.Fog(0x1e293b, 20, 80);
      this.dirLight.color.setHex(0x94a3b8);
      this.dirLight.intensity = 1.3;
      this.hemiLight.color.setHex(0x64748b);
      this.hemiLight.groundColor.setHex(0x0f172a);
      if (this.rainSystem) this.rainSystem.visible = true;
    }
  }

  private pickNextTheme(): WorldChunk['theme'] {
    const themes: WorldChunk['theme'][] = ['CITY', 'RAIL', 'TUNNEL', 'BRIDGE', 'PARK'];
    return themes[Math.floor(Math.random() * themes.length)];
  }

  public update(playerZ: number, difficulty: number, delta: number) {
    // Check if back chunk is passed
    const backChunk = this.chunks[0];
    if (backChunk.baseZ > playerZ + 40) {
      // Move this chunk to the front
      const frontChunk = this.chunks[this.chunks.length - 1];
      const newZ = frontChunk.baseZ - CHUNK_LENGTH;

      // Recycle chunk
      this.chunks.shift();
      const theme = this.pickNextTheme();
      backChunk.generate(newZ, theme, difficulty);
      this.chunks.push(backChunk);
      this.chunkIndex++;
    }

    // Update moving trains
    this.chunks.forEach((chunk) => {
      chunk.obstacles.forEach((obs) => {
        if ((obs.type === 'TRAIN_MOVING' || obs.type === 'CARTOON_TRAIN_HOLLOW') && obs.speed) {
          // Train moves along track
          obs.mesh.position.z += obs.speed * delta;
          obs.z = chunk.baseZ + obs.mesh.position.z;
          const len = obs.trainLength || 14;
          const h = obs.roofHeight || 3.6;
          obs.box.setFromCenterAndSize(
            new THREE.Vector3(LANES[obs.lane], h / 2, obs.z),
            new THREE.Vector3(2.7, h, len)
          );
          if (obs.isHollowCartoonTrain) {
            obs.rearEntranceZ = obs.z + len / 2;
            obs.frontExitZ = obs.z - len / 2;
          }
        }
      });

      // Animate collectibles (spin coins & float powerups)
      chunk.collectibles.forEach((col) => {
        if (!col.collected) {
          col.mesh.rotation.y += 3.5 * delta;
          col.mesh.position.y = col.initialY + Math.sin(col.mesh.rotation.y * 2) * 0.12;
        }
      });
    });

    // Animate Rain
    if (this.rainSystem && this.rainSystem.visible) {
      this.rainSystem.position.z = playerZ - 20;
      const pos = this.rainSystem.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.rainCount; i++) {
        let y = pos.getY(i) - 35 * delta;
        if (y < 0) y = 25;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  }
}
