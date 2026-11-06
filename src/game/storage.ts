import {
  CharacterDef,
  DailyReward,
  GameSaveData,
  GameSettings,
  HoverboardDef,
  LeaderboardEntry,
  Mission,
  OutfitDef,
  RedeemCodeResult
} from './types';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'dash',
    name: 'Dash',
    tagline: 'Street Parkour Prodigy',
    gender: 'male',
    unlockedByDefault: true,
    perkDescription: 'Balanced agility and fast recovery',
    perkMultiplierBonus: 1,
    primaryColor: '#ef4444', // Red hoodie
    secondaryColor: '#1e293b', // Dark jeans
    accentColor: '#f59e0b', // Gold kicks
    hairColor: '#451a03',
    skinColor: '#fbcfe8',
  },
  {
    id: 'maya',
    name: 'Maya',
    tagline: 'Cyber Neon Hacker',
    gender: 'female',
    priceCoins: 3000,
    perkDescription: '+25% Coin Magnet attraction radius',
    perkMagnetBonus: 0.25,
    primaryColor: '#06b6d4', // Cyan cyber jacket
    secondaryColor: '#4c1d95', // Deep purple pants
    accentColor: '#ec4899', // Hot pink visor
    hairColor: '#a855f7',
    skinColor: '#fed7aa',
  },
  {
    id: 'jax',
    name: 'Jax',
    tagline: 'Skate Yard Legend',
    gender: 'male',
    priceCoins: 6000,
    perkDescription: '+35% Longer 2X Double Coin duration',
    perkCoinDurationBonus: 0.35,
    primaryColor: '#10b981', // Emerald oversized hoodie
    secondaryColor: '#334155', // Baggy cargo
    accentColor: '#eab308', // Headphone yellow
    hairColor: '#1e293b',
    skinColor: '#d97706',
  },
  {
    id: 'nova',
    name: 'Nova',
    tagline: 'Prototype Android Speedster',
    gender: 'android',
    priceDiamonds: 50,
    perkDescription: 'Starts every run with an automatic 10s Hoverboard shield',
    primaryColor: '#6366f1', // Indigo sleek armor
    secondaryColor: '#0f172a', // Obsidian carbon fiber
    accentColor: '#38bdf8', // Glowing cyan core
    hairColor: '#93c5fd',
    skinColor: '#e2e8f0',
  },
  {
    id: 'volt',
    name: 'Captain Volt',
    tagline: 'Electrified City Protector',
    gender: 'legendary',
    priceDiamonds: 120,
    perkDescription: 'Permanent +2x Score Multiplier & 50% more Blue Diamonds',
    perkMultiplierBonus: 2,
    primaryColor: '#eab308', // Gold armor with cape
    secondaryColor: '#1e1b4b', // Midnight blue suit
    accentColor: '#facc15', // Lightning aura
    hairColor: '#ffffff',
    skinColor: '#ffedd5',
  },
];

export const OUTFITS: OutfitDef[] = [
  {
    id: 'dash_default',
    characterId: 'dash',
    name: 'Original Red',
    jacketColor: '#ef4444',
    pantsColor: '#1e293b',
    shoesColor: '#f59e0b',
  },
  {
    id: 'dash_neon',
    characterId: 'dash',
    name: 'Cyber Neon',
    priceCoins: 1500,
    jacketColor: '#14b8a6',
    pantsColor: '#090d16',
    shoesColor: '#06b6d4',
    glowColor: '#2dd4bf',
  },
  {
    id: 'dash_gold',
    characterId: 'dash',
    name: 'Gold Champion',
    priceDiamonds: 30,
    jacketColor: '#f59e0b',
    pantsColor: '#78350f',
    shoesColor: '#fef08a',
    glowColor: '#fbbf24',
  },
  {
    id: 'maya_default',
    characterId: 'maya',
    name: 'Cyberpunk Cyan',
    jacketColor: '#06b6d4',
    pantsColor: '#4c1d95',
    shoesColor: '#ec4899',
  },
  {
    id: 'maya_stealth',
    characterId: 'maya',
    name: 'Shadow Infiltrator',
    priceCoins: 2500,
    jacketColor: '#0f172a',
    pantsColor: '#1e293b',
    shoesColor: '#38bdf8',
    glowColor: '#0284c7',
  },
];

export const HOVERBOARDS: HoverboardDef[] = [
  {
    id: 'classic',
    name: 'Classic Cruiser',
    description: 'Dependable street board with aerodynamic fin.',
    unlockedByDefault: true,
    colorA: '#ef4444',
    colorB: '#ffffff',
    glowColor: '#f87171',
    trailType: 'spark',
  },
  {
    id: 'neon',
    name: 'Neon Blade',
    description: 'Holographic edge that cuts through city wind.',
    priceCoins: 2500,
    colorA: '#06b6d4',
    colorB: '#ec4899',
    glowColor: '#22d3ee',
    trailType: 'neon',
  },
  {
    id: 'firestorm',
    name: 'Firestorm',
    description: 'Blazing rocket thrusters and flame particle exhaust.',
    priceCoins: 5000,
    colorA: '#f97316',
    colorB: '#ef4444',
    glowColor: '#fb923c',
    trailType: 'fire',
  },
  {
    id: 'quantum',
    name: 'Quantum Glide',
    description: 'Futuristic magnetic levitation board with plasma trail.',
    priceDiamonds: 40,
    colorA: '#8b5cf6',
    colorB: '#3b82f6',
    glowColor: '#c084fc',
    trailType: 'lightning',
  },
  {
    id: 'cyber',
    name: 'Cyber Wave',
    description: 'Retro 80s grid patterned deck with neon laser fins.',
    priceDiamonds: 75,
    colorA: '#f43f5e',
    colorB: '#e11d48',
    glowColor: '#fb7185',
    trailType: 'neon',
  },
];

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 500, diamonds: 5, hoverboards: 1 },
  { day: 2, coins: 800, diamonds: 10, hoverboards: 2 },
  { day: 3, coins: 1200, diamonds: 15, hoverboards: 2 },
  { day: 4, coins: 1800, diamonds: 20, hoverboards: 3 },
  { day: 5, coins: 2500, diamonds: 25, hoverboards: 4, specialLabel: 'Mystery Box!' },
  { day: 6, coins: 3500, diamonds: 35, hoverboards: 5 },
  { day: 7, coins: 5000, diamonds: 50, hoverboards: 10, specialLabel: 'JACKPOT REWARD!' },
];

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm_coins_1',
    title: 'Coin Collector',
    description: 'Collect 150 coins in a single run',
    target: 150,
    current: 0,
    rewardCoins: 500,
    rewardDiamonds: 5,
    completed: false,
    claimed: false,
    type: 'COINS',
  },
  {
    id: 'm_jumps_1',
    title: 'High Leaper',
    description: 'Perform 12 jumps over barriers',
    target: 12,
    current: 0,
    rewardCoins: 400,
    rewardDiamonds: 3,
    completed: false,
    claimed: false,
    type: 'JUMPS',
  },
  {
    id: 'm_slides_1',
    title: 'Limbo Master',
    description: 'Slide under 8 low barriers or signs',
    target: 8,
    current: 0,
    rewardCoins: 450,
    rewardDiamonds: 4,
    completed: false,
    claimed: false,
    type: 'SLIDES',
  },
  {
    id: 'm_score_1',
    title: 'Score Hunter',
    description: 'Reach a score of 10,000 points',
    target: 10000,
    current: 0,
    rewardCoins: 800,
    rewardDiamonds: 10,
    completed: false,
    claimed: false,
    type: 'SCORE',
  },
  {
    id: 'm_trains_1',
    title: 'Train Surfer',
    description: 'Surfing or jumping on top of 5 trains',
    target: 5,
    current: 0,
    rewardCoins: 600,
    rewardDiamonds: 6,
    completed: false,
    claimed: false,
    type: 'TRAINS',
  },
  {
    id: 'm_distance_1',
    title: 'Marathon Escape',
    description: 'Run 1,200 meters in a single sprint',
    target: 1200,
    current: 0,
    rewardCoins: 1000,
    rewardDiamonds: 15,
    completed: false,
    claimed: false,
    type: 'DISTANCE',
  },
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'CyberPhantom_99', score: 148520, character: 'Captain Volt', avatarColor: '#facc15', distance: 8420 },
  { rank: 2, name: 'NeonSpeedster', score: 98400, character: 'Nova', avatarColor: '#38bdf8', distance: 5890 },
  { rank: 3, name: 'RailRiderX', score: 84300, character: 'Jax', avatarColor: '#10b981', distance: 5120 },
  { rank: 4, name: 'GlitchRunner', score: 62100, character: 'Maya', avatarColor: '#a855f7', distance: 3940 },
  { rank: 5, name: 'SubwayAce', score: 45800, character: 'Dash', avatarColor: '#ef4444', distance: 3100 },
  { rank: 6, name: 'TokyoDrifter', score: 32400, character: 'Dash', avatarColor: '#f59e0b', distance: 2450 },
  { rank: 7, name: 'PixelPursuit', score: 21500, character: 'Maya', avatarColor: '#06b6d4', distance: 1800 },
  { rank: 8, name: 'UrbanFox', score: 14200, character: 'Jax', avatarColor: '#3b82f6', distance: 1220 },
];

const STORAGE_KEY = 'dash_city_escape_run_v1';

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.65,
  sfxVolume: 0.85,
  graphicsQuality: 'HIGH',
  showOnScreenControls: true,
  swipeSensitivity: 1.0,
  vibration: true,
  fpsDisplay: false,
};

export function loadGameData(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Ensure missing keys are merged
      return {
        coins: data.coins ?? 500,
        diamonds: data.diamonds ?? 10,
        hoverboardsStock: data.hoverboardsStock ?? 5,
        highScore: data.highScore ?? 0,
        selectedCharacter: data.selectedCharacter ?? 'dash',
        unlockedCharacters: data.unlockedCharacters ?? ['dash'],
        selectedOutfit: data.selectedOutfit ?? { dash: 'dash_default' },
        unlockedOutfits: data.unlockedOutfits ?? ['dash_default'],
        selectedHoverboard: data.selectedHoverboard ?? 'classic',
        unlockedHoverboards: data.unlockedHoverboards ?? ['classic'],
        powerUpLevels: {
          magnet: data.powerUpLevels?.magnet ?? 1,
          superJump: data.powerUpLevels?.superJump ?? 1,
          jetpack: data.powerUpLevels?.jetpack ?? 1,
          shield: data.powerUpLevels?.shield ?? 1,
          doubleCoins: data.powerUpLevels?.doubleCoins ?? 1,
          hoverboard: data.powerUpLevels?.hoverboard ?? 1,
        },
        redeemedCodes: data.redeemedCodes ?? [],
        lastLoginDate: data.lastLoginDate ?? getTodayDateString(),
        dailyStreak: data.dailyStreak ?? 1,
        claimedDailyDays: data.claimedDailyDays ?? [],
        missions: data.missions ?? DEFAULT_MISSIONS,
        stats: {
          totalRuns: data.stats?.totalRuns ?? 0,
          totalDistance: data.stats?.totalDistance ?? 0,
          totalCoinsCollected: data.stats?.totalCoinsCollected ?? 0,
          totalDiamondsCollected: data.stats?.totalDiamondsCollected ?? 0,
          bestScore: data.stats?.bestScore ?? 0,
          highestMultiplier: data.stats?.highestMultiplier ?? 1,
          trainsSurfed: data.stats?.trainsSurfed ?? 0,
          policeEscapes: data.stats?.policeEscapes ?? 0,
        },
        settings: {
          ...DEFAULT_SETTINGS,
          ...(data.settings || {}),
        },
        luckySpinLastUsed: data.luckySpinLastUsed ?? 0,
      };
    }
  } catch (err) {
    console.error('Failed to load game save data:', err);
  }

  // Brand new save
  return {
    coins: 500,
    diamonds: 10,
    hoverboardsStock: 5,
    highScore: 0,
    selectedCharacter: 'dash',
    unlockedCharacters: ['dash'],
    selectedOutfit: { dash: 'dash_default' },
    unlockedOutfits: ['dash_default'],
    selectedHoverboard: 'classic',
    unlockedHoverboards: ['classic'],
    powerUpLevels: {
      magnet: 1,
      superJump: 1,
      jetpack: 1,
      shield: 1,
      doubleCoins: 1,
      hoverboard: 1,
    },
    redeemedCodes: [],
    lastLoginDate: getTodayDateString(),
    dailyStreak: 1,
    claimedDailyDays: [],
    missions: DEFAULT_MISSIONS,
    stats: {
      totalRuns: 0,
      totalDistance: 0,
      totalCoinsCollected: 0,
      totalDiamondsCollected: 0,
      bestScore: 0,
      highestMultiplier: 1,
      trainsSurfed: 0,
      policeEscapes: 0,
    },
    settings: DEFAULT_SETTINGS,
    luckySpinLastUsed: 0,
  };
}

export function saveGameData(data: GameSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save game data:', err);
  }
}

// Custom code database (Admin created + built-in)
const CUSTOM_CODES_KEY = 'dash_city_custom_codes_v1';

export interface CustomCodeDef {
  code: string;
  coins: number;
  diamonds: number;
  hoverboards?: number;
  characterId?: string;
  outfitId?: string;
}

export function getCustomCodes(): Record<string, CustomCodeDef> {
  try {
    const raw = localStorage.getItem(CUSTOM_CODES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {};
}

export function saveCustomCode(codeDef: CustomCodeDef): boolean {
  try {
    const codes = getCustomCodes();
    codes[codeDef.code.toUpperCase()] = codeDef;
    localStorage.setItem(CUSTOM_CODES_KEY, JSON.stringify(codes));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function redeemCode(inputCode: string, currentData: GameSaveData): { result: RedeemCodeResult; updatedData: GameSaveData } {
  const code = inputCode.trim().toUpperCase();

  if (!code) {
    return {
      result: { success: false, message: 'Please enter a redeem code!' },
      updatedData: currentData,
    };
  }

  if (currentData.redeemedCodes.includes(code)) {
    return {
      result: { success: false, message: 'Code already redeemed!' },
      updatedData: currentData,
    };
  }

  const updatedData = { ...currentData, redeemedCodes: [...currentData.redeemedCodes, code] };

  // Built-in codes
  if (code === 'DASH100') {
    updatedData.coins += 1000;
    return {
      result: { success: true, message: 'Success! You received 1,000 Gold Coins!', coins: 1000 },
      updatedData,
    };
  }

  if (code === 'DIAMOND50') {
    updatedData.diamonds += 50;
    return {
      result: { success: true, message: 'Success! You received 50 Blue Diamonds!', diamonds: 50 },
      updatedData,
    };
  }

  if (code === 'SUPERPLAYER') {
    if (!updatedData.unlockedCharacters.includes('nova')) {
      updatedData.unlockedCharacters.push('nova');
    }
    updatedData.diamonds += 25;
    return {
      result: { success: true, message: 'JACKPOT! Special Character Nova + 25 Diamonds unlocked!', characterId: 'nova', diamonds: 25 },
      updatedData,
    };
  }

  if (code === 'FREERUN') {
    if (!updatedData.unlockedOutfits.includes('dash_neon')) {
      updatedData.unlockedOutfits.push('dash_neon');
    }
    updatedData.coins += 1500;
    return {
      result: { success: true, message: 'Unlocked Cyber Neon Outfit + 1,500 Coins!', outfitId: 'dash_neon', coins: 1500 },
      updatedData,
    };
  }

  if (code === 'BOOST2026') {
    updatedData.coins += 2500;
    updatedData.diamonds += 30;
    updatedData.hoverboardsStock += 10;
    return {
      result: { success: true, message: 'Mega Booster Pack: 2,500 Coins, 30 Diamonds & 10 Hoverboards!', coins: 2500, diamonds: 30 },
      updatedData,
    };
  }

  // Check admin custom codes
  const customCodes = getCustomCodes();
  if (customCodes[code]) {
    const custom = customCodes[code];
    if (custom.coins) updatedData.coins += custom.coins;
    if (custom.diamonds) updatedData.diamonds += custom.diamonds;
    if (custom.hoverboards) updatedData.hoverboardsStock += custom.hoverboards;
    if (custom.characterId && !updatedData.unlockedCharacters.includes(custom.characterId)) {
      updatedData.unlockedCharacters.push(custom.characterId);
    }
    if (custom.outfitId && !updatedData.unlockedOutfits.includes(custom.outfitId)) {
      updatedData.unlockedOutfits.push(custom.outfitId);
    }

    return {
      result: {
        success: true,
        message: `Admin Code Redeemed! +${custom.coins || 0} Coins, +${custom.diamonds || 0} Diamonds`,
        coins: custom.coins,
        diamonds: custom.diamonds,
        characterId: custom.characterId,
      },
      updatedData,
    };
  }

  return {
    result: { success: false, message: 'Invalid code. Try DASH100, DIAMOND50, SUPERPLAYER, FREERUN, or BOOST2026!' },
    updatedData: currentData,
  };
}
