import * as THREE from 'three';

/**
 * Procedural Canvas Textures & PBR Materials
 * 100% generated in-code - Zero external image files / 404 dependencies!
 */

// Generate Procedural Railway Asphalt / Track bed
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base dark asphalt
  ctx.fillStyle = '#1e222d';
  ctx.fillRect(0, 0, 512, 512);

  // Gravel flecks
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 2 + 1;
    const shade = Math.floor(Math.random() * 60 + 35);
    ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 6})`;
    ctx.fillRect(x, y, size, size);
  }

  // Steel rail sheen guide lines
  ctx.strokeStyle = 'rgba(70, 85, 110, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 0); ctx.lineTo(128, 512);
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(384, 0); ctx.lineTo(384, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate Hazard Warning Stripes (for barrier posts and train buffers)
export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#eab308'; // Bright safety yellow
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#0f172a'; // Black hazard stripes
  const stripeWidth = 32;
  for (let i = -256; i < 512; i += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeWidth, 0);
    ctx.lineTo(i + stripeWidth - 256, 256);
    ctx.lineTo(i - 256, 256);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate Subway Graffiti / City Mural texture for train sides
export function createTrainSideTexture(trainColor = '#ef4444'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base train body
  ctx.fillStyle = trainColor;
  ctx.fillRect(0, 0, 1024, 512);

  // Metal panel seams
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 1004, 492);

  // Train Windows
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 4; i++) {
    const wx = 120 + i * 210;
    ctx.fillRect(wx, 80, 160, 140);
    // Tint / reflection in window
    const grad = ctx.createLinearGradient(wx, 80, wx + 160, 220);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.8)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(wx + 6, 86, 148, 128);
  }

  // Graffiti tag / "DASH ESCAPE" lettering
  ctx.font = 'bold 54px Impact, Arial Black';
  ctx.fillStyle = '#facc15';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillText('⚡ DASH SUBWAY ⚡', 240, 360);

  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('METRO RAPID EXPRESS 2026', 280, 410);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate Realistic Modern Metro Train Texture (Sleek aerodynamic livery, LED displays, doors)
export function createMetroSideTexture(baseColor = '#0284c7', stripeColor = '#38bdf8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High-gloss metallic gradient body
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.12, '#cbd5e1');
  grad.addColorStop(0.18, baseColor);
  grad.addColorStop(0.72, baseColor);
  grad.addColorStop(0.78, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Aerodynamic speed stripe
  ctx.fillStyle = stripeColor;
  ctx.fillRect(0, 120, 1024, 20);

  // Dark tinted panoramic window band
  ctx.fillStyle = '#090d16';
  ctx.fillRect(40, 150, 944, 150);

  // Individual illuminated passenger window panes with warm interior glow
  for (let i = 0; i < 5; i++) {
    const wx = 60 + i * 185;
    const winGrad = ctx.createLinearGradient(wx, 160, wx, 280);
    winGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    winGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.25)'); // Warm interior cabin light
    winGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
    ctx.fillStyle = winGrad;
    ctx.fillRect(wx, 160, 160, 125);

    // Window frame rubber seals
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, 160, 160, 125);
  }

  // Automatic Passenger Sliding Doors with yellow warning edging
  [220, 680].forEach((dx) => {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.strokeRect(dx, 140, 110, 310);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dx + 55, 140);
    ctx.lineTo(dx + 55, 450);
    ctx.stroke();
  });

  // Digital LED Destination Display: "EXPRESS LINE 1"
  ctx.fillStyle = '#050505';
  ctx.fillRect(380, 70, 260, 36);
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#22c55e';
  ctx.textAlign = 'center';
  ctx.fillText('● DASH METRO EXP ●', 510, 95);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate Realistic Corrugated Shipping Container Texture (for freight trains)
export function createContainerTexture(baseColor: string, brandText: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base industrial paint
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 1024, 512);

  // Vertical corrugation fluting (shadows & highlights)
  const ribWidth = 24;
  for (let x = 0; x < 1024; x += ribWidth) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x, 0, 6, 512);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(x + 6, 0, 6, 512);
  }

  // Heavy steel corner frame castings
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, 24, 512);
  ctx.fillRect(1000, 0, 24, 512);
  ctx.fillRect(0, 0, 1024, 20);
  ctx.fillRect(0, 492, 1024, 20);

  // Stenciled Shipping Logo & ID
  ctx.font = '900 68px Arial Black, Impact';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText(brandText, 512, 270);

  // ISO Specs and Hazard Diamond
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('MAX GROSS 32,500 KG  •  TARE 3,800 KG', 512, 330);
  ctx.fillText('DASH FREIGHT LOGISTICS  [ISO-668]', 512, 360);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate Fluted Stainless Steel Commuter Train Texture
export function createCommuterSideTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base stainless steel sheen
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#e2e8f0');
  grad.addColorStop(0.5, '#cbd5e1');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Horizontal fluted stainless ribs
  for (let y = 300; y < 490; y += 12) {
    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.fillRect(0, y, 1024, 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(0, y + 4, 1024, 4);
  }

  // Windows with commuter seating silhouettes
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 4; i++) {
    const wx = 100 + i * 220;
    ctx.fillRect(wx, 130, 170, 130);

    const winGrad = ctx.createLinearGradient(wx, 130, wx, 260);
    winGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    winGrad.addColorStop(0.6, 'rgba(253, 224, 71, 0.3)');
    winGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = winGrad;
    ctx.fillRect(wx + 6, 136, 158, 118);
  }

  // Bold Commuter Rail Red/Blue Stripe
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 95, 1024, 14);
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 109, 1024, 14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate Coin Face Texture
export function createCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Radial Gold Sheen
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.5, '#eab308');
  grad.addColorStop(0.85, '#ca8a04');
  grad.addColorStop(1, '#854d0e');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  // Coin Rim
  ctx.strokeStyle = '#fef9c3';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  // Star / D Symbol
  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 110px Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('D', 128, 134);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate City Skyscraper Billboard Texture
export function createNeonAdTexture(text: string, bgColor: string, neonColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 480, 224);

  ctx.font = 'bold 44px Impact, sans-serif';
  ctx.fillStyle = neonColor;
  ctx.textAlign = 'center';
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 15;
  ctx.fillText(text, 256, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Master Materials Cache
export class MaterialLibrary {
  public asphaltMaterial: THREE.MeshStandardMaterial;
  public railSteelMaterial: THREE.MeshStandardMaterial;
  public woodSleeperMaterial: THREE.MeshStandardMaterial;
  public hazardMaterial: THREE.MeshStandardMaterial;
  public coinMaterial: THREE.MeshStandardMaterial;
  public diamondMaterial: THREE.MeshPhysicalMaterial;
  public trainRedMaterial: THREE.MeshStandardMaterial;
  public trainBlueMaterial: THREE.MeshStandardMaterial;
  public trainGreenMaterial: THREE.MeshStandardMaterial;

  // New Realistic Train Materials
  public metroCyanMaterial: THREE.MeshStandardMaterial;
  public metroRedMaterial: THREE.MeshStandardMaterial;
  public metroSilverMaterial: THREE.MeshStandardMaterial;
  public cargoBlueMaterial: THREE.MeshStandardMaterial;
  public cargoOrangeMaterial: THREE.MeshStandardMaterial;
  public cargoGreenMaterial: THREE.MeshStandardMaterial;
  public cargoRedMaterial: THREE.MeshStandardMaterial;
  public commuterStainlessMaterial: THREE.MeshStandardMaterial;
  public headlightLensMaterial: THREE.MeshBasicMaterial;
  public headlightBeamMaterial: THREE.MeshBasicMaterial;
  public tailLightMaterial: THREE.MeshBasicMaterial;
  public bogieSteelMaterial: THREE.MeshStandardMaterial;
  public wheelRimMaterial: THREE.MeshStandardMaterial;
  public roofTreadMaterial: THREE.MeshStandardMaterial;
  public pantographMaterial: THREE.MeshStandardMaterial;

  public barrierConcreteMaterial: THREE.MeshStandardMaterial;
  public buildingGlassMaterial: THREE.MeshPhysicalMaterial;
  public buildingWallMaterial: THREE.MeshStandardMaterial;
  public neonGlowMaterial: THREE.MeshBasicMaterial;

  constructor() {
    const asphaltTex = createAsphaltTexture();
    const hazardTex = createHazardTexture();
    const coinTex = createCoinTexture();
    const redTrainTex = createTrainSideTexture('#dc2626');
    const blueTrainTex = createTrainSideTexture('#2563eb');
    const greenTrainTex = createTrainSideTexture('#059669');

    // High detail train textures
    const metroCyanTex = createMetroSideTexture('#0284c7', '#38bdf8');
    const metroRedTex = createMetroSideTexture('#dc2626', '#f87171');
    const cargoBlueTex = createContainerTexture('#1e40af', 'DASH FREIGHT');
    const cargoOrangeTex = createContainerTexture('#ea580c', 'CARGO NEXUS');
    const cargoGreenTex = createContainerTexture('#065f46', 'METRO PACIFIC');
    const cargoRedTex = createContainerTexture('#991b1b', 'GLOBAL LOGISTICS');
    const commuterTex = createCommuterSideTexture();

    this.asphaltMaterial = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.85,
      metalness: 0.15,
    });

    this.railSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
    });

    this.woodSleeperMaterial = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.hazardMaterial = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.5,
      metalness: 0.2,
    });

    this.coinMaterial = new THREE.MeshStandardMaterial({
      map: coinTex,
      metalness: 0.9,
      roughness: 0.2,
      color: 0xffd700,
    });

    this.diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.7,
      transparent: true,
      opacity: 0.95,
      ior: 2.1,
    });

    this.trainRedMaterial = new THREE.MeshStandardMaterial({
      map: redTrainTex,
      roughness: 0.35,
      metalness: 0.45,
    });

    this.trainBlueMaterial = new THREE.MeshStandardMaterial({
      map: blueTrainTex,
      roughness: 0.35,
      metalness: 0.45,
    });

    this.trainGreenMaterial = new THREE.MeshStandardMaterial({
      map: greenTrainTex,
      roughness: 0.35,
      metalness: 0.45,
    });

    // Realistic Modern Metro Materials
    this.metroCyanMaterial = new THREE.MeshStandardMaterial({
      map: metroCyanTex,
      roughness: 0.25,
      metalness: 0.65,
    });

    this.metroRedMaterial = new THREE.MeshStandardMaterial({
      map: metroRedTex,
      roughness: 0.25,
      metalness: 0.65,
    });

    this.metroSilverMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Cargo Container Materials
    this.cargoBlueMaterial = new THREE.MeshStandardMaterial({
      map: cargoBlueTex,
      roughness: 0.55,
      metalness: 0.3,
    });

    this.cargoOrangeMaterial = new THREE.MeshStandardMaterial({
      map: cargoOrangeTex,
      roughness: 0.55,
      metalness: 0.3,
    });

    this.cargoGreenMaterial = new THREE.MeshStandardMaterial({
      map: cargoGreenTex,
      roughness: 0.55,
      metalness: 0.3,
    });

    this.cargoRedMaterial = new THREE.MeshStandardMaterial({
      map: cargoRedTex,
      roughness: 0.55,
      metalness: 0.3,
    });

    // Commuter Stainless Steel Material
    this.commuterStainlessMaterial = new THREE.MeshStandardMaterial({
      map: commuterTex,
      roughness: 0.3,
      metalness: 0.75,
    });

    // Headlight Lens and Glow Cones
    this.headlightLensMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    this.headlightBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.35,
    });

    this.tailLightMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });

    // Mechanical Train Bogie & Wheel Materials
    this.bogieSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.8,
    });

    this.wheelRimMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.95,
    });

    this.roofTreadMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.4,
    });

    this.pantographMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Copper-accented pantograph
      roughness: 0.4,
      metalness: 0.85,
    });

    this.barrierConcreteMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.9,
      metalness: 0.1,
    });

    this.buildingGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.15,
      metalness: 0.8,
    });

    this.buildingWallMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2230,
      roughness: 0.8,
      metalness: 0.2,
    });

    this.neonGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
    });
  }
}
