import React from 'react';
import confetti from 'canvas-confetti';
import { X, Check, Calendar, Gift, Sparkles } from 'lucide-react';
import { DAILY_REWARDS, getTodayDateString } from '../game/storage';
import { GameSaveData } from '../game/types';
import { audio } from '../game/audio';

interface DailyRewardsModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onClose: () => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const todayStr = getTodayDateString();
  const currentStreakDay = ((saveData.dailyStreak - 1) % 7) + 1;
  const isTodayClaimed = saveData.claimedDailyDays.includes(currentStreakDay) && saveData.lastLoginDate === todayStr;

  const handleClaim = () => {
    if (isTodayClaimed) return;

    const reward = DAILY_REWARDS.find((r) => r.day === currentStreakDay) || DAILY_REWARDS[0];
    audio.playVictory();

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    onUpdateSave({
      ...saveData,
      coins: saveData.coins + reward.coins,
      diamonds: saveData.diamonds + reward.diamonds,
      hoverboardsStock: saveData.hoverboardsStock + (reward.hoverboards || 0),
      claimedDailyDays: [...saveData.claimedDailyDays, currentStreakDay],
      lastLoginDate: todayStr,
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="text-emerald-400" size={22} />
            <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
              7-DAY LOGIN STREAK REWARDS
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

        {/* Subtitle */}
        <p className="text-xs text-slate-400 mt-2">
          Log in every consecutive day to earn bigger rewards! Day 7 unlocks the mega jackpot prize.
        </p>

        {/* 7 Day Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 my-5">
          {DAILY_REWARDS.map((r) => {
            const isPast = r.day < currentStreakDay;
            const isCurrent = r.day === currentStreakDay;
            const isClaimed = saveData.claimedDailyDays.includes(r.day) && (isPast || (isCurrent && isTodayClaimed));

            return (
              <div
                key={r.day}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center relative ${
                  isCurrent
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : isClaimed
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                {/* Day Header */}
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isCurrent ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Day {r.day}
                </span>

                {/* Gift Icon / Chest */}
                <div className="my-2">
                  <span className="text-2xl">{r.day === 7 ? '👑' : '🎁'}</span>
                </div>

                {/* Rewards Description */}
                <div className="text-[11px] font-extrabold text-amber-300">+{r.coins} 🪙</div>
                <div className="text-[11px] font-extrabold text-cyan-300">+{r.diamonds} 💎</div>
                {r.hoverboards && (
                  <div className="text-[10px] font-bold text-rose-300">+{r.hoverboards} 🛹</div>
                )}

                {/* Claimed Indicator */}
                {isClaimed && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/50">
                      <Check size={18} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={handleClaim}
            disabled={isTodayClaimed}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !isTodayClaimed
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-98 text-white shadow-xl shadow-emerald-600/30 border border-emerald-300'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Sparkles size={18} />
            <span>{isTodayClaimed ? 'TODAY CLAIMED - COME BACK TOMORROW' : `CLAIM DAY ${currentStreakDay} REWARD!`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
