import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Sparkles, Trophy, Zap, AlertTriangle } from 'lucide-react';
import { audio } from '../game/audio';

interface GameOverModalProps {
  score: number;
  coins: number;
  diamonds: number;
  distance: number;
  highScore: boolean;
  reason: string;
  playerDiamonds: number;
  onRevive: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coins,
  diamonds,
  distance,
  highScore,
  reason,
  playerDiamonds,
  onRevive,
  onRestart,
  onMainMenu,
}) => {
  useEffect(() => {
    if (highScore) {
      audio.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [highScore]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Busted Header */}
        <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm uppercase tracking-widest bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/30 mb-2">
          <AlertTriangle size={16} />
          <span>{reason || 'RUN OVER'}</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black font-arcade uppercase text-white tracking-wide">
          {highScore ? '🎉 NEW RECORD!' : 'GAME OVER'}
        </h2>

        {/* Score Display */}
        <div className="my-5 w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-inner">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FINAL SCORE</span>
          <span className="text-4xl md:text-5xl font-black font-arcade text-yellow-400 drop-shadow mt-1">
            {score.toLocaleString()}
          </span>

          {highScore && (
            <div className="mt-2 flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-3 py-1 rounded-full text-xs font-black">
              <Trophy size={14} />
              <span>PERSONAL BEST RECORD!</span>
            </div>
          )}
        </div>

        {/* Run Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-6">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-lg">🪙</span>
            <span className="text-xs text-slate-400 font-semibold mt-0.5">Coins</span>
            <span className="font-bold text-amber-300 font-mono text-sm">+{coins}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-lg">💎</span>
            <span className="text-xs text-slate-400 font-semibold mt-0.5">Diamonds</span>
            <span className="font-bold text-cyan-300 font-mono text-sm">+{diamonds}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-lg">🏃</span>
            <span className="text-xs text-slate-400 font-semibold mt-0.5">Distance</span>
            <span className="font-bold text-slate-200 font-mono text-sm">{distance}m</span>
          </div>
        </div>

        {/* Revive Button */}
        {playerDiamonds >= 5 && (
          <button
            onClick={() => {
              audio.playClick();
              onRevive();
            }}
            className="w-full mb-3 py-3 rounded-2xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-98 text-white shadow-lg shadow-cyan-600/30 border border-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={18} />
            <span>REVIVE & CONTINUE (5 💎)</span>
          </button>
        )}

        {/* Action Buttons: Play Again & Main Menu */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm tracking-widest uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-98 text-white shadow-xl shadow-emerald-600/30 border border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onMainMenu();
            }}
            className="w-14 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 shadow-lg transition-all cursor-pointer"
            aria-label="Main Menu"
          >
            <Home size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
