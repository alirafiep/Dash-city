import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, Award, Trophy, Sparkles } from 'lucide-react';
import { GameSaveData, Mission } from '../game/types';
import { audio } from '../game/audio';

interface MissionsModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [tab, setTab] = useState<'MISSIONS' | 'ACHIEVEMENTS'>('MISSIONS');

  const handleClaimMission = (missionId: string) => {
    const mission = saveData.missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    audio.playVictory();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });

    const updatedMissions = saveData.missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );

    onUpdateSave({
      ...saveData,
      coins: saveData.coins + mission.rewardCoins,
      diamonds: saveData.diamonds + mission.rewardDiamonds,
      missions: updatedMissions,
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl h-[85vh] bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="text-purple-400" size={24} />
            <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
              RUNNER MISSIONS & TROPHIES
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 my-3 rounded-2xl">
          <button
            onClick={() => {
              audio.playClick();
              setTab('MISSIONS');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'MISSIONS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={16} />
            <span>Active Missions</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setTab('ACHIEVEMENTS');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'ACHIEVEMENTS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy size={16} />
            <span>Career Trophies</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {tab === 'MISSIONS' ? (
            saveData.missions.map((mission) => {
              const progressPct = Math.min(100, Math.floor((mission.current / mission.target) * 100));

              return (
                <div
                  key={mission.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    mission.claimed
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                      : mission.completed
                      ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white">{mission.title}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-amber-400">+{mission.rewardCoins} 🪙</span>
                        <span className="text-cyan-400">+{mission.rewardDiamonds} 💎</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{mission.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">
                        {mission.current} / {mission.target}
                      </span>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div className="shrink-0">
                    {mission.claimed ? (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Check size={14} /> Claimed
                      </span>
                    ) : mission.completed ? (
                      <button
                        onClick={() => handleClaimMission(mission.id)}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs uppercase px-4 py-2 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles size={14} /> Claim
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-xl">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* Career Achievements */
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">First 1,000m Sprint</h4>
                  <p className="text-xs text-slate-400">Escape for more than 1 kilometer</p>
                </div>
                <span className="text-xs font-bold text-amber-400">
                  {saveData.stats.totalDistance >= 1000 ? '✅ UNLOCKED' : `${saveData.stats.totalDistance}/1000m`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Coin Tycoon</h4>
                  <p className="text-xs text-slate-400">Collect over 5,000 total gold coins</p>
                </div>
                <span className="text-xs font-bold text-amber-400">
                  {saveData.stats.totalCoinsCollected >= 5000 ? '✅ UNLOCKED' : `${saveData.stats.totalCoinsCollected}/5000`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Score Legend</h4>
                  <p className="text-xs text-slate-400">Reach a high score of 50,000</p>
                </div>
                <span className="text-xs font-bold text-amber-400">
                  {saveData.highScore >= 50000 ? '✅ UNLOCKED' : `${saveData.highScore}/50000`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
