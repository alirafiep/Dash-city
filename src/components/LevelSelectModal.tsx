import React from 'react';
import { X, Check, MapPin, Gauge, Award, Sparkles } from 'lucide-react';
import { GAME_LEVELS } from '../game/storage';
import { GameLevelDef, GameSaveData } from '../game/types';
import { audio } from '../game/audio';

interface LevelSelectModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onSelectLevelAndPlay: (levelId: GameLevelDef['id']) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  saveData,
  onUpdateSave,
  onSelectLevelAndPlay,
  onClose,
}) => {
  const currentLevelId = saveData.selectedLevel || 'DOWNTOWN';

  const handleSelectLevel = (level: GameLevelDef) => {
    audio.playClick();
    onUpdateSave({
      ...saveData,
      selectedLevel: level.id,
    });
  };

  const handlePlayLevel = (level: GameLevelDef) => {
    audio.playVictory();
    onUpdateSave({
      ...saveData,
      selectedLevel: level.id,
    });
    onSelectLevelAndPlay(level.id);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl h-[88vh] bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
                SELECT GAME LEVEL & TRACK
              </h2>
              <p className="text-xs text-slate-400">Choose your environment, challenges, and cartoon trains</p>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3">
          {GAME_LEVELS.map((level) => {
            const isSelected = currentLevelId === level.id;

            return (
              <div
                key={level.id}
                onClick={() => handleSelectLevel(level)}
                className={`relative p-4 md:p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-gradient-to-r from-slate-850 to-slate-800 border-emerald-400 shadow-xl shadow-emerald-500/15'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start md:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {level.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 uppercase tracking-wider">
                        {level.theme}
                      </span>
                      {level.targetTrainEntries && (
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Award size={12} />
                          {level.targetTrainEntries} REAR ENTRIES
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-black font-arcade text-white mt-1">
                      {level.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 max-w-md">{level.description}</p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <Gauge size={13} className="text-cyan-400" />
                        <span>SPEED x{level.speedModifier.toFixed(2)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-rose-400" />
                        <span>WEATHER: {level.weather}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Select & Play Action */}
                <div className="flex items-center gap-2 md:self-center shrink-0">
                  {isSelected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayLevel(level);
                      }}
                      className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <Sparkles size={16} />
                      <span>PLAY TRACK</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectLevel(level);
                      }}
                      className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check size={14} />
                      <span>SELECT</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
