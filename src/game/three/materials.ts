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
