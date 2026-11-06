import * as THREE from 'three';
import { CharacterDef, HoverboardDef, OutfitDef } from '../types';

/**
 * Procedural 3D Character Rigs
 * Multi-part composite hierarchies with procedural skeletal/limb kinematics
 */

export class PlayerRig {
  public group: THREE.Group;

  // Limb pivot groups for animation
  private torso: THREE.Group;
  private head: THREE.Group;
  private leftArmPivot: THREE.Group;
  private rightArmPivot: THREE.Group;
  private leftLegPivot: THREE.Group;
  private rightLegPivot: THREE.Group;
  private hoverboardGroup: THREE.Group;
  private hoverboardMesh: THREE.Mesh | null = null;
  private capeMesh: THREE.Mesh | null = null;

  // Material handles for outfit customization
  private jacketMat: THREE.MeshStandardMaterial;
  private pantsMat: THREE.MeshStandardMaterial;
  private shoesMat: THREE.MeshStandardMaterial;
  private skinMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;
  private boardMat: THREE.MeshStandardMaterial;

  constructor(character: CharacterDef, outfit?: OutfitDef, hoverboard?: HoverboardDef) {
    this.group = new THREE.Group();
    this.group.name = 'PlayerRig';

    // Base materials
    this.jacketMat = new THREE.MeshStandardMaterial({
      color: outfit?.jacketColor || character.primaryColor,
      roughness: 0.6,
      metalness: 0.1,
    });
    this.pantsMat = new THREE.MeshStandardMaterial({
      color: outfit?.pantsColor || character.secondaryColor,
      roughness: 0.7,
      metalness: 0.05,
    });
    this.shoesMat = new THREE.MeshStandardMaterial({
      color: outfit?.shoesColor || character.accentColor,
      roughness: 0.4,
      metalness: 0.3,
    });
    this.skinMat = new THREE.MeshStandardMaterial({
      color: character.skinColor,
      roughness: 0.8,
    });
    this.hairMat = new THREE.MeshStandardMaterial({
      color: character.hairColor,
      roughness: 0.7,
    });
    this.boardMat = new THREE.MeshStandardMaterial({
      color: hoverboard?.colorA || '#ef4444',
      metalness: 0.7,
      roughness: 0.25,
      emissive: new THREE.Color(hoverboard?.glowColor || '#f87171'),
      emissiveIntensity: 0.25,
    });

    // 1. Torso
    this.torso = new THREE.Group();
    this.torso.position.y = 1.1; // pivot height
    this.group.add(this.torso);

    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.3);
    const torsoMesh = new THREE.Mesh(torsoGeo, this.jacketMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoMesh.position.y = 0.25;
    this.torso.add(torsoMesh);

    // Backpack / Hoodie Accent
    const packGeo = new THREE.BoxGeometry(0.38, 0.45, 0.16);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 0.25, -0.2);
    packMesh.castShadow = true;
    this.torso.add(packMesh);

    // Legendary Cape for Volt
    if (character.gender === 'legendary') {
      const capeGeo = new THREE.PlaneGeometry(0.48, 0.9);
      const capeMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        roughness: 0.6,
      });
      this.capeMesh = new THREE.Mesh(capeGeo, capeMat);
      this.capeMesh.position.set(0, 0.2, -0.25);
      this.capeMesh.rotation.x = 0.15;
      this.torso.add(this.capeMesh);
    }

    // 2. Head & Hair / Hat
    this.head = new THREE.Group();
    this.head.position.y = 0.62;
    this.torso.add(this.head);

    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, this.skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Hair or Cap
    if (character.gender === 'female') {
      // Ponytail / stylish fringe
      const hairGeo = new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const hairMesh = new THREE.Mesh(hairGeo, this.hairMat);
      hairMesh.position.y = 0.05;
      this.head.add(hairMesh);

      const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.4, 8), this.hairMat);
      ponytail.position.set(0, 0.05, -0.24);
      ponytail.rotation.x = -0.5;
      this.head.add(ponytail);
    } else {
      // Baseball Cap / Spiky Hair
      const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.16, 12), this.jacketMat);
      capCrown.position.y = 0.1;
      this.head.add(capCrown);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.25), this.shoesMat);
      visor.position.set(0, 0.07, 0.2);
      this.head.add(visor);
    }

    // Cyber Visor / Glasses for Maya or Nova
    if (character.id === 'maya' || character.id === 'nova') {
      const visorGeo = new THREE.BoxGeometry(0.34, 0.09, 0.12);
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
      });
      const cyberVisor = new THREE.Mesh(visorGeo, visorMat);
      cyberVisor.position.set(0, 0.02, 0.18);
      this.head.add(cyberVisor);
    }

    // 3. Left Arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.32, 0.5, 0);
    this.torso.add(this.leftArmPivot);

    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8);
    armGeo.translate(0, -0.25, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.jacketMat);
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);

    // Left Hand
    const handGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const leftHand = new THREE.Mesh(handGeo, this.skinMat);
    leftHand.position.set(0, -0.52, 0);
    this.leftArmPivot.add(leftHand);

    // 4. Right Arm
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.32, 0.5, 0);
    this.torso.add(this.rightArmPivot);

    const rightArmMesh = new THREE.Mesh(armGeo, this.jacketMat);
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);

    // Right Hand
    const rightHand = new THREE.Mesh(handGeo, this.skinMat);
    rightHand.position.set(0, -0.52, 0);
    this.rightArmPivot.add(rightHand);

    // 5. Left Leg
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.16, 0.95, 0);
    this.group.add(this.leftLegPivot);

    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8);
    legGeo.translate(0, -0.32, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    leftLegMesh.castShadow = true;
    this.leftLegPivot.add(leftLegMesh);

    // Left Sneaker
    const shoeGeo = new THREE.BoxGeometry(0.18, 0.16, 0.35);
    const leftShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    leftShoe.position.set(0, -0.68, 0.08);
    leftShoe.castShadow = true;
    this.leftLegPivot.add(leftShoe);

    // 6. Right Leg
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.16, 0.95, 0);
    this.group.add(this.rightLegPivot);

    const rightLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    rightLegMesh.castShadow = true;
    this.rightLegPivot.add(rightLegMesh);

    // Right Sneaker
    const rightShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    rightShoe.position.set(0, -0.68, 0.08);
    rightShoe.castShadow = true;
    this.rightLegPivot.add(rightShoe);

    // 7. Hoverboard (at feet, visible when active)
    this.hoverboardGroup = new THREE.Group();
    this.hoverboardGroup.position.set(0, 0.15, 0);
    this.hoverboardGroup.visible = false;
    this.group.add(this.hoverboardGroup);

    this.createHoverboardMesh();

    // 8. Jetpack (mounted on back, visible when active)
    this.jetpackGroup = new THREE.Group();
    this.jetpackGroup.position.set(0, 0.25, -0.22);
    this.jetpackGroup.visible = false;
    this.torso.add(this.jetpackGroup);
    this.createJetpackMesh();

    // 9. Punch Energy Aura (on right fist)
    const punchAuraGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const punchAuraMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.8,
    });
    this.punchAuraMesh = new THREE.Mesh(punchAuraGeo, punchAuraMat);
    this.punchAuraMesh.position.set(0, -0.52, 0);
    this.punchAuraMesh.visible = false;
    this.rightArmPivot.add(this.punchAuraMesh);
  }

  private jetpackGroup: THREE.Group;
  private jetpackFlames: THREE.Mesh[] = [];
  private punchAuraMesh: THREE.Mesh;

  private createJetpackMesh() {
    const canisterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.2,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
    });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    // Dual Rocket Cylinders
    [-0.14, 0.14].forEach((x) => {
      const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 8), canisterMat);
      canister.position.set(x, 0, 0);
      this.jetpackGroup.add(canister);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), stripeMat);
      cap.position.set(x, 0.27, 0);
      this.jetpackGroup.add(cap);

      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8), stripeMat);
      nozzle.position.set(x, -0.32, 0);
      this.jetpackGroup.add(nozzle);

      // Rocket flame cone
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), flameMat);
      flame.rotation.x = Math.PI;
      flame.position.set(x, -0.52, 0);
      this.jetpackGroup.add(flame);
      this.jetpackFlames.push(flame);
    });
  }

  public setJetpackVisible(visible: boolean) {
    this.jetpackGroup.visible = visible;
  }

  public setPunchAura(visible: boolean) {
    this.punchAuraMesh.visible = visible;
  }

  private createHoverboardMesh() {
    const deckGeo = new THREE.BoxGeometry(0.7, 0.08, 1.6);
    this.hoverboardMesh = new THREE.Mesh(deckGeo, this.boardMat);
    this.hoverboardMesh.castShadow = true;
    this.hoverboardGroup.add(this.hoverboardMesh);

    // Neon Thruster Jets
    const jetGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.25, 8);
    const jetMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const jetL = new THREE.Mesh(jetGeo, jetMat);
    jetL.rotation.x = Math.PI / 2;
    jetL.position.set(-0.22, -0.04, -0.75);
    const jetR = jetL.clone();
    jetR.position.x = 0.22;
    this.hoverboardGroup.add(jetL, jetR);
  }

  public setHoverboardVisible(visible: boolean) {
    this.hoverboardGroup.visible = visible;
  }

  public updateSkin(character: CharacterDef, outfit?: OutfitDef, hoverboard?: HoverboardDef) {
    this.jacketMat.color.set(outfit?.jacketColor || character.primaryColor);
    this.pantsMat.color.set(outfit?.pantsColor || character.secondaryColor);
    this.shoesMat.color.set(outfit?.shoesColor || character.accentColor);
    this.skinMat.color.set(character.skinColor);
    this.hairMat.color.set(character.hairColor);

    if (hoverboard) {
      this.boardMat.color.set(hoverboard.colorA);
      this.boardMat.emissive.set(hoverboard.glowColor);
    }
  }

  public animate(
    time: number,
    state: 'RUN' | 'JUMP' | 'SLIDE' | 'HOVER' | 'STUMBLE' | 'BUSTED' | 'CLIMB' | 'PUNCH' | 'JETPACK',
    speedRatio: number,
    laneOffsetRatio = 0
  ) {
    const runFreq = (speedRatio * 14);

    // Punch aura toggle
    this.punchAuraMesh.visible = (state === 'PUNCH');
    // Jetpack toggle
    this.jetpackGroup.visible = (state === 'JETPACK');

    if (state === 'PUNCH') {
      // Powerful forward lunging punch
      this.torso.rotation.x = 0.32;
      this.torso.position.y = 1.05;
      this.rightArmPivot.rotation.x = -1.65; // Direct punch forward
      this.rightArmPivot.rotation.y = -0.2;
      this.rightArmPivot.rotation.z = 0;
      this.leftArmPivot.rotation.x = 0.6; // Guard position
      this.leftLegPivot.rotation.x = -0.6;
      this.rightLegPivot.rotation.x = 0.4;
      return;
    }

    if (state === 'JETPACK') {
      // High-altitude superhero flight
      this.hoverboardGroup.visible = false;
      this.torso.rotation.x = 0.82; // Streamlined forward flight
      this.torso.position.y = 1.1 + Math.sin(time * 6) * 0.06;
      this.torso.rotation.z = -laneOffsetRatio * 0.4; // Bank in turns

      this.leftArmPivot.rotation.x = -1.4;
      this.rightArmPivot.rotation.x = -1.4;
      this.leftArmPivot.rotation.z = -0.3;
      this.rightArmPivot.rotation.z = 0.3;

      this.leftLegPivot.rotation.x = 0.75;
      this.rightLegPivot.rotation.x = 0.7;

      // Rocket flame flicker
      this.jetpackFlames.forEach((f) => {
        f.scale.set(1, 0.75 + Math.random() * 0.6, 1);
      });
      return;
    }

    if (state === 'CLIMB') {
      // Parkour vault / ladder climb onto roof
      this.hoverboardGroup.visible = false;
      this.torso.rotation.x = 0.2;
      this.torso.position.y = 1.05;
      const climbCycle = Math.sin(time * 20);
      this.leftArmPivot.rotation.x = -1.9 + climbCycle * 0.4;
      this.rightArmPivot.rotation.x = -1.9 - climbCycle * 0.4;
      this.leftArmPivot.rotation.z = -0.2;
      this.rightArmPivot.rotation.z = 0.2;
      this.leftLegPivot.rotation.x = -0.6 - climbCycle * 0.5;
      this.rightLegPivot.rotation.x = -0.6 + climbCycle * 0.5;
      return;
    }

    if (state === 'BUSTED') {
      // Fall back animation
      this.torso.rotation.x = THREE.MathUtils.damp(this.torso.rotation.x, 0.8, 10, 0.016);
      this.torso.position.y = THREE.MathUtils.damp(this.torso.position.y, 0.6, 10, 0.016);
      this.leftArmPivot.rotation.x = 1.2;
      this.rightArmPivot.rotation.x = 1.1;
      this.leftLegPivot.rotation.x = -0.5;
      this.rightLegPivot.rotation.x = 0.3;
      return;
    }

    if (state === 'SLIDE') {
      // Duck and slide
      this.torso.rotation.x = THREE.MathUtils.damp(this.torso.rotation.x, -0.7, 16, 0.016);
      this.torso.position.y = THREE.MathUtils.damp(this.torso.position.y, 0.6, 16, 0.016);
      this.leftLegPivot.rotation.x = -1.1;
      this.rightLegPivot.rotation.x = -1.15;
      this.leftArmPivot.rotation.x = 0.9;
      this.rightArmPivot.rotation.x = 0.9;
      return;
    }

    if (state === 'HOVER') {
      // Surfing on hoverboard
      this.hoverboardGroup.visible = true;
      this.torso.position.y = 1.15 + Math.sin(time * 6) * 0.04;
      this.torso.rotation.x = 0;
      this.torso.rotation.y = 0.45; // Surfer side stance
      this.torso.rotation.z = -laneOffsetRatio * 0.3; // Bank into turns

      this.leftLegPivot.rotation.x = -0.15;
      this.rightLegPivot.rotation.x = 0.15;
      this.leftLegPivot.position.y = 0.95;
      this.rightLegPivot.position.y = 0.95;

      this.leftArmPivot.rotation.x = 0.3;
      this.leftArmPivot.rotation.z = -0.4;
      this.rightArmPivot.rotation.x = -0.2;
      this.rightArmPivot.rotation.z = 0.5;

      this.hoverboardGroup.rotation.y = 0;
      this.hoverboardGroup.rotation.z = -laneOffsetRatio * 0.35;
      return;
    }

    this.hoverboardGroup.visible = false;

    if (state === 'JUMP') {
      // Tuck legs in air, arms out
      this.torso.rotation.x = -0.2;
      this.torso.position.y = 1.1;
      this.leftLegPivot.rotation.x = -0.85;
      this.rightLegPivot.rotation.x = -0.65;
      this.leftArmPivot.rotation.x = -0.9;
      this.leftArmPivot.rotation.z = -0.3;
      this.rightArmPivot.rotation.x = -0.9;
      this.rightArmPivot.rotation.z = 0.3;
      return;
    }

    // Default Running Cycle
    const legAngle = Math.sin(time * runFreq) * 0.9;
    const armAngle = -Math.sin(time * runFreq) * 0.85;
    const bounce = Math.abs(Math.sin(time * runFreq)) * 0.12;

    this.torso.position.y = 1.1 + bounce;
    this.torso.rotation.x = 0.12; // Forward athletic lean
    this.torso.rotation.y = Math.sin(time * runFreq) * 0.08;
    this.torso.rotation.z = -laneOffsetRatio * 0.25;

    this.leftLegPivot.rotation.x = legAngle;
    this.rightLegPivot.rotation.x = -legAngle;
    this.leftArmPivot.rotation.x = armAngle;
    this.rightArmPivot.rotation.x = -armAngle;
    this.leftArmPivot.rotation.z = -0.15;
    this.rightArmPivot.rotation.z = 0.15;

    if (this.capeMesh) {
      this.capeMesh.rotation.x = 0.4 + Math.sin(time * runFreq * 1.5) * 0.25;
    }
  }
}

/**
 * Police Officer Rig (chasing right behind player with baton)
 */
export class PoliceOfficerRig {
  public group: THREE.Group;
  private torso: THREE.Group;
  private leftArmPivot: THREE.Group;
  private rightArmPivot: THREE.Group;
  private leftLegPivot: THREE.Group;
  private rightLegPivot: THREE.Group;
  private batonMesh: THREE.Mesh;
  private sirenLight: THREE.PointLight;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PoliceOfficerRig';

    const uniformMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 }); // Police Navy
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.8 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3, metalness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });

    // Torso (Stout, authoritarian build)
    this.torso = new THREE.Group();
    this.torso.position.y = 1.25;
    this.group.add(this.torso);

    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.38), uniformMat);
    chestMesh.castShadow = true;
    chestMesh.position.y = 0.25;
    this.torso.add(chestMesh);

    // Police Badge
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.04), goldMat);
    badge.position.set(-0.18, 0.45, 0.21);
    this.torso.add(badge);

    // Flashing siren light on shoulder
    this.sirenLight = new THREE.PointLight(0xef4444, 2, 8);
    this.sirenLight.position.set(0.3, 0.65, 0);
    this.torso.add(this.sirenLight);

    // Head with Police Peaked Cap
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.7;
    this.torso.add(headGroup);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Aviator sunglasses
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    glasses.position.set(0, 0.04, 0.22);
    headGroup.add(glasses);

    // Peaked Police Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.16, 12), uniformMat);
    cap.position.y = 0.16;
    headGroup.add(cap);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.24), bootMat);
    capVisor.position.set(0, 0.1, 0.22);
    capVisor.rotation.x = 0.15;
    headGroup.add(capVisor);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.6, 8);
    armGeo.translate(0, -0.28, 0);

    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.4, 0.55, 0);
    const lArm = new THREE.Mesh(armGeo, uniformMat);
    lArm.castShadow = true;
    this.leftArmPivot.add(lArm);
    this.torso.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.4, 0.55, 0);
    const rArm = new THREE.Mesh(armGeo, uniformMat);
    rArm.castShadow = true;
    this.rightArmPivot.add(rArm);
    this.torso.add(this.rightArmPivot);

    // Police Baton in right hand
    const batonGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.65, 8);
    this.batonMesh = new THREE.Mesh(batonGeo, bootMat);
    this.batonMesh.position.set(0, -0.58, 0.2);
    this.batonMesh.rotation.x = Math.PI / 2.5;
    this.rightArmPivot.add(this.batonMesh);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.75, 8);
    legGeo.translate(0, -0.36, 0);

    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.2, 1.05, 0);
    const lLeg = new THREE.Mesh(legGeo, pantsMat);
    lLeg.castShadow = true;
    this.leftLegPivot.add(lLeg);
    this.group.add(this.leftLegPivot);

    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.38), bootMat);
    lBoot.position.set(0, -0.78, 0.1);
    this.leftLegPivot.add(lBoot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.2, 1.05, 0);
    const rLeg = new THREE.Mesh(legGeo, pantsMat);
    rLeg.castShadow = true;
    this.rightLegPivot.add(rLeg);
    this.group.add(this.rightLegPivot);

    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.38), bootMat);
    rBoot.position.set(0, -0.78, 0.1);
    this.rightLegPivot.add(rBoot);
  }

  public animate(time: number, speedRatio: number, isBusted = false) {
    if (isBusted) {
      this.torso.rotation.x = 0;
      this.rightArmPivot.rotation.x = -1.2; // Pointing / grabbing
      this.leftArmPivot.rotation.x = -0.5;
      return;
    }

    const freq = speedRatio * 13;
    const legAngle = Math.sin(time * freq) * 0.85;
    const armAngle = -Math.sin(time * freq) * 0.9;
    const bounce = Math.abs(Math.sin(time * freq)) * 0.1;

    this.torso.position.y = 1.25 + bounce;
    this.torso.rotation.x = 0.18; // Heavy forward dash
    this.leftLegPivot.rotation.x = legAngle;
    this.rightLegPivot.rotation.x = -legAngle;

    this.leftArmPivot.rotation.x = armAngle;
    this.rightArmPivot.rotation.x = -armAngle + 0.3; // Swing baton

    // Flashing red/blue siren light
    const isRed = Math.floor(time * 8) % 2 === 0;
    this.sirenLight.color.setHex(isRed ? 0xef4444 : 0x3b82f6);
  }
}

/**
 * Police Dog Rig (German Shepherd K9 chasing alongside officer)
 */
export class PoliceDogRig {
  public group: THREE.Group;
  private body: THREE.Group;
  private head: THREE.Group;
  private tail: THREE.Group;
  private flLeg: THREE.Group;
  private frLeg: THREE.Group;
  private blLeg: THREE.Group;
  private brLeg: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PoliceDogRig';

    const furTanMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.9 });
    const furDarkMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });

    // Canine Body
    this.body = new THREE.Group();
    this.body.position.y = 0.55;
    this.group.add(this.body);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.85), furTanMat);
    torsoMesh.castShadow = true;
    this.body.add(torsoMesh);

    // Dark saddle back
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.6), furDarkMat);
    saddle.position.set(0, 0.15, 0.05);
    this.body.add(saddle);

    // Dog Head & Snout
    this.head = new THREE.Group();
    this.head.position.set(0, 0.28, 0.45);
    this.body.add(this.head);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.28), furTanMat);
    this.head.add(skull);

    // Red K9 Collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.2), collarMat);
    collar.position.set(0, -0.1, -0.05);
    this.head.add(collar);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.25), furDarkMat);
    snout.position.set(0, -0.05, 0.22);
    this.head.add(snout);

    // Alert Ears
    const earGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
    const lEar = new THREE.Mesh(earGeo, furDarkMat);
    lEar.position.set(-0.1, 0.2, -0.02);
    const rEar = new THREE.Mesh(earGeo, furDarkMat);
    rEar.position.set(0.1, 0.2, -0.02);
    this.head.add(lEar, rEar);

    // Wagging / Galloping Tail
    this.tail = new THREE.Group();
    this.tail.position.set(0, 0.1, -0.42);
    const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.45, 6), furDarkMat);
    tailMesh.rotation.x = -0.7;
    tailMesh.position.set(0, 0.12, -0.16);
    this.tail.add(tailMesh);
    this.body.add(this.tail);

    // 4 Running Paws
    const legGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.42, 6);
    legGeo.translate(0, -0.2, 0);

    this.flLeg = new THREE.Group();
    this.flLeg.position.set(-0.15, 0, 0.28);
    this.flLeg.add(new THREE.Mesh(legGeo, furTanMat));
    this.body.add(this.flLeg);

    this.frLeg = new THREE.Group();
    this.frLeg.position.set(0.15, 0, 0.28);
    this.frLeg.add(new THREE.Mesh(legGeo, furTanMat));
    this.body.add(this.frLeg);

    this.blLeg = new THREE.Group();
    this.blLeg.position.set(-0.15, 0, -0.28);
    this.blLeg.add(new THREE.Mesh(legGeo, furDarkMat));
    this.body.add(this.blLeg);

    this.brLeg = new THREE.Group();
    this.brLeg.position.set(0.15, 0, -0.28);
    this.brLeg.add(new THREE.Mesh(legGeo, furDarkMat));
    this.body.add(this.brLeg);
  }

  public animate(time: number, speedRatio: number) {
    const freq = speedRatio * 18; // Fast canine gallop
    const gallopFront = Math.sin(time * freq) * 0.8;
    const gallopBack = Math.cos(time * freq) * 0.8;

    this.body.position.y = 0.55 + Math.abs(Math.sin(time * freq)) * 0.12;
    this.body.rotation.x = Math.sin(time * freq) * 0.15;

    this.flLeg.rotation.x = gallopFront;
    this.frLeg.rotation.x = -gallopFront * 0.7;
    this.blLeg.rotation.x = -gallopBack;
    this.brLeg.rotation.x = gallopBack * 0.7;

    this.tail.rotation.y = Math.sin(time * 16) * 0.5; // Fast wagging
    this.head.rotation.x = -Math.sin(time * freq) * 0.1;
  }
}
