import React from 'react';
import { Pause, Zap, Shield, Magnet, ArrowUpCircle, Flame, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { PowerUpActiveState } from '../game/types';

interface GameHUDProps {
  score: number;
  highScore: number;
  coins: number;
  diamonds: number;
  distance: number;
  multiplier: number;
  powerUps: PowerUpActiveState;
  policeWarning: boolean;
  hoverboardsStock: number;
  showOnScreenControls: boolean;
  isInsideTrain?: boolean;
  isSkating?: boolean;
  onToggleSkateboard?: () => void;
  onPause: () => void;
  onDeployHoverboard: () => void;
  onPunch: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  coins,
  diamonds,
  distance,
  multiplier,
  powerUps,
  policeWarning,
  hoverboardsStock,
  showOnScreenControls,
  isInsideTrain = false,
  isSkating = true,
  onToggleSkateboard,
  onPause,
  onDeployHoverboard,
  onPunch,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Red/Blue Siren Flashing Vignette when police is right on heels */}
      {policeWarning && (
        <div className="absolute inset-0 pointer-events-none animate-pulse border-8 border-red-600/60 shadow-[inset_0_0_80px_rgba(239,68,68,0.7)] z-10 flex items-start justify-center pt-20">
          <div className="bg-red-600/90 text-white font-black text-xs md:text-sm px-4 py-1.5 rounded-full shadow-lg tracking-widest uppercase flex items-center gap-2 border border-yellow-300">
            <span className="animate-spin text-base">🚨</span>
            POLICE CLOSING IN! DODGE OBSTACLES!
            <span className="animate-spin text-base">🚨</span>
          </div>
        </div>
      )}

      {/* Cartoon Train Interior Riding Banner */}
      {isInsideTrain && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-bounce">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs md:text-sm px-4 py-2 rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center gap-2 tracking-wider uppercase drop-shadow-lg">
            <span className="text-xl">🚂</span>
            <span>RIDING INSIDE CARTOON EXPRESS! COLLECT DONUTS!</span>
            <span className="text-xl">🍩</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex items-start justify-between z-20">
        {/* Left: Score & Distance & Multiplier */}
        <div className="flex flex-col gap-1">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-1.5 shadow-xl flex items-baseline gap-2">
            <span className="text-yellow-400 font-extrabold text-2xl md:text-3xl font-arcade tracking-wider drop-shadow">
              {score.toLocaleString()}
            </span>
            <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-1.5 py-0.5 rounded border border-yellow-500/40">
              x{multiplier}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 px-1">
            <span>{distance}m</span>
            <span>•</span>
            <span className="text-slate-400">BEST: {Math.max(score, highScore).toLocaleString()}</span>
          </div>
        </div>

        {/* Right: Coins, Diamonds & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coins */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
              🪙
            </div>
            <span className="text-amber-300 font-bold text-sm md:text-base font-mono">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Diamonds */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-300 flex items-center justify-center text-xs shadow-sm">
              💎
            </div>
            <span className="text-cyan-300 font-bold text-sm md:text-base font-mono">
              {diamonds.toLocaleString()}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-600 shadow-lg active:scale-95 transition-transform"
            aria-label="Pause"
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* Active Power-up Bars - All 7 Subway Surfers-style abilities */}
      <div className="flex flex-col gap-1.5 max-w-xs z-20 pointer-events-none mt-2">
        {powerUps.jetpack > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-purple-500/80 rounded-lg px-2.5 py-1 text-xs shadow-lg shadow-purple-500/20">
            <span className="text-base">🚀</span>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-black text-purple-300">
                <span>JETPACK SKY FLIGHT</span>
                <span>{Math.ceil(powerUps.jetpack)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(powerUps.jetpack / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {powerUps.superSpeed > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/80 rounded-lg px-2.5 py-1 text-xs shadow-lg shadow-cyan-500/20">
            <span className="text-base">⚡</span>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-black text-cyan-300">
                <span>SUPER SPEED BOOST</span>
                <span>{Math.ceil(powerUps.superSpeed)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(powerUps.superSpeed / 18) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {powerUps.powerPunch > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-orange-500/80 rounded-lg px-2.5 py-1 text-xs shadow-lg shadow-orange-500/20">
            <span className="text-base">🥊</span>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-black text-orange-300">
                <span>POWER PUNCH READY [F]</span>
                <span>{Math.ceil(powerUps.powerPunch)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(powerUps.powerPunch / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {powerUps.hoverboard > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-sm border border-rose-500/60 rounded-lg px-2.5 py-1 text-xs shadow-lg">
            <Flame size={14} className="text-rose-400 animate-pulse" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-rose-300">
                <span>HOVERBOARD CRASH SHIELD</span>
                <span>{Math.ceil(powerUps.hoverboard)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(powerUps.hoverboard / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {powerUps.magnet > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-sm border border-pink-500/60 rounded-lg px-2.5 py-1 text-xs shadow-lg">
            <Magnet size={14} className="text-pink-400" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-pink-300">
                <span>COIN MAGNET</span>
                <span>{Math.ceil(powerUps.magnet)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-pink-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(powerUps.magnet / 18) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {powerUps.doubleCoins > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-sm border border-blue-500/60 rounded-lg px-2.5 py-1 text-xs shadow-lg">
            <Zap size={14} className="text-blue-400" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-blue-300">
                <span>2X COIN MULTIPLIER</span>
                <span>{Math.ceil(powerUps.doubleCoins)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(powerUps.doubleCoins / 24) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {powerUps.superJump > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-sm border border-amber-500/60 rounded-lg px-2.5 py-1 text-xs shadow-lg">
            <ArrowUpCircle size={14} className="text-amber-400" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-amber-300">
                <span>SUPER JUMP BOOTS</span>
                <span>{Math.ceil(powerUps.superJump)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(powerUps.superJump / 18) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls / Virtual Buttons & Hoverboard + Punch Deploy */}
      <div className="flex items-end justify-between z-20 pointer-events-auto pb-2">
        {/* Left Touch Cluster: Left / Right Arrows */}
        {showOnScreenControls ? (
          <div className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-2xl backdrop-blur-xs border border-white/10">
            <button
              onClick={onMoveLeft}
              className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-800/80 active:bg-slate-700 active:scale-95 text-white flex items-center justify-center border border-slate-600/80 shadow-xl transition-all"
              aria-label="Move Left"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={onMoveRight}
              className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-800/80 active:bg-slate-700 active:scale-95 text-white flex items-center justify-center border border-slate-600/80 shadow-xl transition-all"
              aria-label="Move Right"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Center: Action Buttons (Skateboard, Power Punch & Hoverboard) */}
        <div className="flex items-center gap-2">
          {/* Skateboard Active/Toggle Button */}
          {onToggleSkateboard && (
            <button
              onClick={onToggleSkateboard}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-black text-xs md:text-sm tracking-wide uppercase shadow-xl border cursor-pointer active:scale-95 transition-all ${
                isSkating
                  ? 'bg-gradient-to-r from-lime-500 to-emerald-600 border-lime-300 text-slate-950 shadow-lime-500/30'
                  : 'bg-slate-800/80 border-slate-600 text-slate-300'
              }`}
              title="Toggle Skateboard / Running [G]"
            >
              <span className="text-base">🛹</span>
              <span>{isSkating ? 'SKATER [G]' : 'RUN [G]'}</span>
            </button>
          )}

          {/* Power Punch Action Button */}
          <button
            onClick={onPunch}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs md:text-sm tracking-wide uppercase bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 border border-orange-300 text-white shadow-xl shadow-orange-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-base">🥊</span>
            <span>PUNCH [F]</span>
          </button>

          {/* Quick Deploy Hoverboard */}
          <button
            onClick={onDeployHoverboard}
            disabled={powerUps.hoverboard > 0 || hoverboardsStock <= 0}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs md:text-sm tracking-wide uppercase shadow-2xl transition-all active:scale-95 border cursor-pointer ${
              powerUps.hoverboard > 0
                ? 'bg-rose-600/70 border-rose-400 text-white shadow-rose-600/40'
                : hoverboardsStock > 0
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 border-amber-300 text-white hover:brightness-110 shadow-rose-500/30'
                : 'bg-slate-800/70 border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <Flame size={18} />
            <span>{powerUps.hoverboard > 0 ? 'SURFING!' : `BOARD (${hoverboardsStock})`}</span>
          </button>
        </div>

        {/* Right Touch Cluster: Jump / Slide */}
        {showOnScreenControls && (
          <div className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-2xl backdrop-blur-xs border border-white/10">
            <button
              onClick={onJump}
              className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-cyan-700/80 active:bg-cyan-600 active:scale-95 text-white flex flex-col items-center justify-center border border-cyan-500/80 shadow-xl transition-all"
              aria-label="Jump"
            >
              <ArrowUp size={24} />
              <span className="text-[10px] font-bold">JUMP</span>
            </button>
            <button
              onClick={onSlide}
              className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-amber-700/80 active:bg-amber-600 active:scale-95 text-white flex flex-col items-center justify-center border border-amber-500/80 shadow-xl transition-all"
              aria-label="Slide"
            >
              <ArrowDown size={24} />
              <span className="text-[10px] font-bold">SLIDE</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
