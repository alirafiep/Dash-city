import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy } from 'lucide-react';
import { GameSaveData } from '../game/types';
import { audio } from '../game/audio';

interface LuckySpinModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onClose: () => void;
}

interface WheelPrize {
  label: string;
  coins?: number;
  diamonds?: number;
  hoverboards?: number;
  color: string;
}

const PRIZES: WheelPrize[] = [
  { label: '500 Coins', coins: 500, color: '#ef4444' },
  { label: '10 Diamonds', diamonds: 10, color: '#06b6d4' },
  { label: '1,000 Coins', coins: 1000, color: '#f59e0b' },
  { label: '2 Hoverboards', hoverboards: 2, color: '#8b5cf6' },
  { label: '2,500 Coins', coins: 2500, color: '#10b981' },
  { label: '25 Diamonds', diamonds: 25, color: '#3b82f6' },
  { label: '5 Hoverboards', hoverboards: 5, color: '#ec4899' },
  { label: 'JACKPOT 5K', coins: 5000, diamonds: 50, color: '#eab308' },
];

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);

  const canFreeSpin = Date.now() - saveData.luckySpinLastUsed > 4 * 60 * 60 * 1000; // 4 hours

  const spin = () => {
    if (isSpinning) return;
    if (!canFreeSpin && saveData.diamonds < 10) return;

    audio.playClick();
    setIsSpinning(true);
    setWonPrize(null);

    // Consume 10 diamonds if not free
    let currentDiamonds = saveData.diamonds;
    if (!canFreeSpin) {
      currentDiamonds -= 10;
    }

    const prizeIdx = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = 360 / PRIZES.length;
    // Extra rotations (5 to 8 full spins)
    const extraSpins = 360 * 6;
    const targetAngle = extraSpins + (360 - prizeIdx * sliceAngle - sliceAngle / 2);

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = PRIZES[prizeIdx];
      setWonPrize(prize);
      audio.playVictory();

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Apply winnings
      onUpdateSave({
        ...saveData,
        diamonds: currentDiamonds + (prize.diamonds || 0),
        coins: saveData.coins + (prize.coins || 0),
        hoverboardsStock: saveData.hoverboardsStock + (prize.hoverboards || 0),
        luckySpinLastUsed: Date.now(),
      });
    }, 4000);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="text-rose-400" size={22} />
            <h2 className="text-xl font-black font-arcade uppercase text-white tracking-wide">
              LUCKY FORTUNE SPIN
            </h2>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Wheel Container */}
        <div className="relative my-6 flex items-center justify-center">
          {/* Top Ticker Needle */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* Wheel Disc */}
          <div
            className="w-64 h-64 md:w-72 md:h-72 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {PRIZES.map((prize, idx) => {
              const angle = (360 / PRIZES.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute inset-0 flex items-start justify-center origin-center pt-2"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div
                    className="w-24 text-center font-black text-[11px] leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                    style={{ color: '#ffffff' }}
                  >
                    {prize.label}
                  </div>
                </div>
              );
            })}

            {/* Canvas Wheel Background Slices */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {PRIZES.map((prize, idx) => {
                const total = PRIZES.length;
                const angle = 360 / total;
                const startAngle = (idx * angle - 90) * (Math.PI / 180);
                const endAngle = ((idx + 1) * angle - 90) * (Math.PI / 180);
                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);

                return (
                  <path
                    key={idx}
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="#0f172a"
                    strokeWidth="1.2"
                  />
                );
              })}
            </svg>
          </div>

          {/* Center Hub */}
          <div className="absolute w-14 h-14 rounded-full bg-slate-900 border-3 border-yellow-400 shadow-xl flex items-center justify-center font-black text-xs text-yellow-300">
            DASH
          </div>
        </div>

        {/* Won Prize Notification */}
        {wonPrize && (
          <div className="mb-4 bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-3 w-full animate-in zoom-in-95">
            <div className="text-xs font-bold text-yellow-300 uppercase">YOU WON!</div>
            <div className="text-lg font-black text-white font-arcade mt-0.5">
              🎉 {wonPrize.label} 🎉
            </div>
          </div>
        )}

        {/* Spin Action Button */}
        <button
          onClick={spin}
          disabled={isSpinning || (!canFreeSpin && saveData.diamonds < 10)}
          className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest uppercase bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-500 hover:brightness-110 active:scale-98 text-white shadow-xl shadow-rose-600/30 border border-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles size={18} />
          <span>
            {isSpinning
              ? 'SPINNING...'
              : canFreeSpin
              ? 'FREE SPIN NOW!'
              : 'SPIN FOR 10 💎'}
          </span>
        </button>

        {!canFreeSpin && (
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            Free spin recharges in 4 hours
          </div>
        )}
      </div>
    </div>
  );
};
