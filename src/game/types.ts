export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'REVIVE';

export type GameMode = 'ENDLESS' | 'TIME_ATTACK' | 'MISSION' | 'DAILY';

export type WeatherType = 'DAY' | 'SUNSET' | 'NIGHT' | 'RAIN';

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export type GameLevelId = 'DOWNTOWN' | 'TRAIN_YARD' | 'NEON_CYBER' | 'SUNSET_BEACH' | 'TRAIN_CHALLENGE';

export interface GameLevelDef {
  id: GameLevelId;
  name: string;
  theme: string;
  description: string;
  weather: WeatherType;
  targetTrainEntries?: number;
  speedModifier: number;
  icon: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  tagline: string;
  gender: 'male' | 'female' | 'android' | 'legendary' | 'cartoon';
  priceCoins?: number;
  priceDiamonds?: number;
  unlockedByDefault?: boolean;
  perkDescription: string;
  perkMultiplierBonus?: number;
  perkMagnetBonus?: number;
  perkCoinDurationBonus?: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hairColor: string;
  skinColor: string;
  avatarEmoji?: string;
  funnyQuote?: string;
}

export interface OutfitDef {
  id: string;
  characterId: string;
  name: string;
  priceCoins?: number;
  priceDiamonds?: number;
  jacketColor: string;
  pantsColor: string;
  shoesColor: string;
  glowColor?: string;
}

export interface HoverboardDef {
  id: string;
  name: string;
  description: string;
  priceCoins?: number;
  priceDiamonds?: number;
  unlockedByDefault?: boolean;
  colorA: string;
  colorB: string;
  glowColor: string;
  trailType: 'spark' | 'neon' | 'fire' | 'lightning';
}

export interface PowerUpActiveState {
  magnet: number; // remaining seconds
  superJump: number;
  superSpeed: number;
  powerPunch: number; // active duration or punch energy
  jetpack: number;
  shield: number;
  doubleCoins: number;
  hoverboard: number;
}

export interface PowerUpLevels {
  magnet: number;
  superJump: number;
  superSpeed: number;
  powerPunch: number;
  jetpack: number;
  shield: number;
  doubleCoins: number;
  hoverboard: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardDiamonds: number;
  completed: boolean;
  claimed: boolean;
  type: 'COINS' | 'JUMPS' | 'SLIDES' | 'SCORE' | 'TRAINS' | 'DISTANCE' | 'TRAIN_ENTRY';
}

export interface DailyReward {
  day: number;
  coins: number;
  diamonds: number;
  hoverboards?: number;
  specialLabel?: string;
}

export interface PlayerStats {
  totalRuns: number;
  totalDistance: number;
  totalCoinsCollected: number;
  totalDiamondsCollected: number;
  bestScore: number;
  highestMultiplier: number;
  trainsSurfed: number;
  trainsEntered: number;
  policeEscapes: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: GraphicsQuality;
  showOnScreenControls: boolean;
  swipeSensitivity: number; // 0.5 to 1.5
  vibration: boolean;
  fpsDisplay: boolean;
}

export interface GameSaveData {
  coins: number;
  diamonds: number;
  hoverboardsStock: number;
  highScore: number;
  selectedCharacter: string;
  unlockedCharacters: string[];
  selectedOutfit: Record<string, string>; // characterId -> outfitId
  unlockedOutfits: string[];
  selectedHoverboard: string;
  unlockedHoverboards: string[];
  selectedLevel: GameLevelId;
  isSkateboardMode: boolean;
  powerUpLevels: PowerUpLevels;
  redeemedCodes: string[];
  lastLoginDate: string; // YYYY-MM-DD
  dailyStreak: number;
  claimedDailyDays: number[];
  missions: Mission[];
  stats: PlayerStats;
  settings: GameSettings;
  luckySpinLastUsed: number; // timestamp
}

export interface RedeemCodeResult {
  success: boolean;
  message: string;
  coins?: number;
  diamonds?: number;
  characterId?: string;
  outfitId?: string;
  hoverboardId?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  character: string;
  avatarColor: string;
  distance: number;
  isPlayer?: boolean;
}
