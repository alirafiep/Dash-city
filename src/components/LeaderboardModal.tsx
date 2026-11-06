import React, { useState } from 'react';
import { X, Trophy, Medal, Award, Flame } from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../game/storage';
import { GameSaveData, LeaderboardEntry } from '../game/types';
import { audio } from '../game/audio';

interface LeaderboardModalProps {
  saveData: GameSaveData;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  saveData,
  onClose,
}) => {
  const [tab, setTab] = useState<'GLOBAL' | 'STATS'>('GLOBAL');

  // Insert player's real high score into leaderboard rankings
  const playerEntry: LeaderboardEntry = {
    rank: 0,
    name: 'YOU (Runner)',
    score: saveData.highScore,
    character: saveData.selectedCharacter.toUpperCase(),
    avatarColor: '#10b981',
    distance: saveData.stats.totalDistance,
    isPlayer: true,
  };

  const combined = [...INITIAL_LEADERBOARD, playerEntry]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl h-[85vh] bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400" size={24} />
            <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
              SUBWAY HALL OF FAME
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
              setTab('GLOBAL');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'GLOBAL'
                ? 'bg-yellow-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy size={16} />
            <span>Global Rankings</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setTab('STATS');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'STATS'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={16} />
            <span>Career Records</span>
          </button>
        </div>

        {/* Content */}
        {tab === 'GLOBAL' ? (
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {combined.map((entry) => {
              return (
                <div
                  key={entry.name}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    entry.isPlayer
                      ? 'bg-emerald-950/60 border-emerald-400/90 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                        entry.rank === 1
                          ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/30'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {entry.rank}
                    </div>

                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        {entry.name}
                        {entry.isPlayer && (
                          <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {entry.character} • {entry.distance}m
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-arcade text-base md:text-lg text-yellow-400 font-black">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">PTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Career Stats Overview */
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 p-1">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">All-Time High Score</span>
              <span className="text-3xl font-black font-arcade text-yellow-400 mt-2">
                {saveData.highScore.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Distance Run</span>
              <span className="text-3xl font-black font-arcade text-cyan-400 mt-2">
                {saveData.stats.totalDistance.toLocaleString()}m
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Gold Coins</span>
              <span className="text-3xl font-black font-arcade text-amber-300 mt-2">
                {saveData.stats.totalCoinsCollected.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Sprints</span>
              <span className="text-3xl font-black font-arcade text-rose-400 mt-2">
                {saveData.stats.totalRuns}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
