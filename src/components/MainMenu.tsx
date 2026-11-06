import React, { useState } from 'react';
import {
  Play,
  Users,
  ShoppingBag,
  Sparkles,
  Calendar,
  Award,
  Gift,
  Trophy,
  Settings,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { GameMode, GameSaveData } from '../game/types';
import { audio } from '../game/audio';
import { CHARACTERS } from '../game/storage';

interface MainMenuProps {
  saveData: GameSaveData;
  onPlay: (mode: GameMode) => void;
  onOpenCharacters: () => void;
  onOpenShop: () => void;
  onOpenLuckySpin: () => void;
  onOpenDailyRewards: () => void;
  onOpenMissions: () => void;
  onOpenRedeemCodes: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onOpenCharacters,
  onOpenShop,
  onOpenLuckySpin,
  onOpenDailyRewards,
  onOpenMissions,
  onOpenRedeemCodes,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('ENDLESS');

  const selectedChar = CHARACTERS.find((c) => c.id === saveData.selectedCharacter) || CHARACTERS[0];

  const handleStart = () => {
    audio.playClick();
    onPlay(selectedMode);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 backdrop-blur-xs select-none overflow-y-auto">
      {/* Top Bar: Currencies, Stats & Settings */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        {/* Character Card Badge */}
        <button
          onClick={() => {
            audio.playClick();
            onOpenCharacters();
          }}
          className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-2 pr-3.5 shadow-xl transition-transform active:scale-95"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-inner border border-white/20"
            style={{ backgroundColor: selectedChar.primaryColor }}
          >
            {selectedChar.name[0]}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">RUNNER</div>
            <div className="text-sm font-extrabold text-white flex items-center gap-1">
              {selectedChar.name}
              <span className="text-xs text-yellow-400">⚡</span>
            </div>
          </div>
        </button>

        {/* Currency Counters & Settings */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Coins */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <span className="text-base">🪙</span>
            <span className="text-amber-300 font-bold text-sm md:text-base font-mono">
              {saveData.coins.toLocaleString()}
            </span>
          </div>

          {/* Diamonds */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <span className="text-base">💎</span>
            <span className="text-cyan-300 font-bold text-sm md:text-base font-mono">
              {saveData.diamonds.toLocaleString()}
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 shadow-lg active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Center: Title Branding & Big Play Button */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-4">
        {/* Neon Badge */}
        <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/50 rounded-full px-4 py-1 text-xs font-black tracking-widest text-rose-300 uppercase shadow-lg shadow-rose-950/40 mb-3">
          <Zap size={14} className="text-rose-400" />
          <span>3D SUBWAY ESCAPE RUNNER</span>
          <Zap size={14} className="text-rose-400" />
        </div>

        {/* Game Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-arcade tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300 drop-shadow-[0_4px_16px_rgba(244,63,94,0.6)]">
          DASH CITY
        </h1>
        <div className="text-lg md:text-2xl font-black tracking-widest text-white/90 drop-shadow uppercase mt-1">
          ESCAPE RUN
        </div>

        {/* High Score & Best Distance */}
        <div className="flex items-center gap-4 mt-3 text-xs md:text-sm font-bold text-slate-300 bg-slate-950/70 border border-white/10 rounded-xl px-5 py-2 shadow-xl">
          <div>
            <span className="text-slate-400">BEST SCORE: </span>
            <span className="text-yellow-400 font-arcade text-base">
              {saveData.highScore.toLocaleString()}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">DISTANCE: </span>
            <span className="text-cyan-400 font-arcade text-base">
              {saveData.stats.totalDistance}m
            </span>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 max-w-xl w-full px-2">
          <button
            onClick={() => {
              audio.playClick();
              setSelectedMode('ENDLESS');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              selectedMode === 'ENDLESS'
                ? 'bg-rose-600/90 border-rose-400 text-white shadow-lg shadow-rose-600/30 scale-102'
                : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={18} className="mb-1" />
            <span>ENDLESS RUN</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setSelectedMode('TIME_ATTACK');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              selectedMode === 'TIME_ATTACK'
                ? 'bg-amber-600/90 border-amber-400 text-white shadow-lg shadow-amber-600/30 scale-102'
                : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={18} className="mb-1" />
            <span>TIME ATTACK</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setSelectedMode('MISSION');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              selectedMode === 'MISSION'
                ? 'bg-purple-600/90 border-purple-400 text-white shadow-lg shadow-purple-600/30 scale-102'
                : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target size={18} className="mb-1" />
            <span>MISSIONS</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setSelectedMode('DAILY');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              selectedMode === 'DAILY'
                ? 'bg-cyan-600/90 border-cyan-400 text-white shadow-lg shadow-cyan-600/30 scale-102'
                : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar size={18} className="mb-1" />
            <span>DAILY RUN</span>
          </button>
        </div>

        {/* Big PLAY Button */}
        <button
          onClick={handleStart}
          className="group relative mt-6 px-10 md:px-14 py-4 md:py-5 rounded-2xl font-black text-xl md:text-2xl font-arcade tracking-widest text-white uppercase bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 active:scale-95 shadow-[0_10px_35px_rgba(16,185,129,0.5)] border-2 border-emerald-300 transition-all flex items-center gap-3 cursor-pointer"
        >
          <Play size={28} className="fill-white group-hover:scale-110 transition-transform" />
          <span>START RUN</span>
        </button>
      </div>

      {/* Bottom Hub Navigation */}
      <div className="w-full max-w-5xl mx-auto pt-2">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {/* Characters */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenCharacters();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 shadow-lg text-slate-300 hover:text-amber-300 active:scale-95 transition-all"
          >
            <Users size={20} className="mb-1 text-amber-400" />
            <span className="text-[11px] font-extrabold uppercase">HEROES</span>
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenShop();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 shadow-lg text-slate-300 hover:text-cyan-300 active:scale-95 transition-all"
          >
            <ShoppingBag size={20} className="mb-1 text-cyan-400" />
            <span className="text-[11px] font-extrabold uppercase">SHOP</span>
          </button>

          {/* Lucky Spin */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenLuckySpin();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 shadow-lg text-slate-300 hover:text-rose-300 active:scale-95 transition-all"
          >
            <Sparkles size={20} className="mb-1 text-rose-400" />
            <span className="text-[11px] font-extrabold uppercase">SPIN</span>
          </button>

          {/* Daily Rewards */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenDailyRewards();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 shadow-lg text-slate-300 hover:text-emerald-300 active:scale-95 transition-all"
          >
            <Calendar size={20} className="mb-1 text-emerald-400" />
            <span className="text-[11px] font-extrabold uppercase">DAILY</span>
          </button>

          {/* Missions */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenMissions();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 shadow-lg text-slate-300 hover:text-purple-300 active:scale-95 transition-all"
          >
            <Award size={20} className="mb-1 text-purple-400" />
            <span className="text-[11px] font-extrabold uppercase">QUESTS</span>
          </button>

          {/* Redeem Codes */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenRedeemCodes();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 shadow-lg text-slate-300 hover:text-yellow-300 active:scale-95 transition-all"
          >
            <Gift size={20} className="mb-1 text-yellow-400" />
            <span className="text-[11px] font-extrabold uppercase">CODES</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenLeaderboard();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 shadow-lg text-slate-300 hover:text-sky-300 active:scale-95 transition-all col-span-2 sm:col-span-1"
          >
            <Trophy size={20} className="mb-1 text-sky-400" />
            <span className="text-[11px] font-extrabold uppercase">RANKS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
