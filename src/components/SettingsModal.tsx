import React, { useState } from 'react';
import { X, Volume2, Monitor, Smartphone, Maximize2, Trash2, Check, RefreshCw } from 'lucide-react';
import { GameSaveData, GraphicsQuality } from '../game/types';
import { audio } from '../game/audio';

interface SettingsModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [confirmReset, setConfirmReset] = useState(false);

  const updateSetting = <K extends keyof typeof saveData.settings>(
    key: K,
    val: typeof saveData.settings[K]
  ) => {
    const updated = {
      ...saveData,
      settings: {
        ...saveData.settings,
        [key]: val,
      },
    };
    onUpdateSave(updated);
  };

  const toggleFullscreen = () => {
    audio.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleResetData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Monitor className="text-cyan-400" size={24} />
            <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
              GAME & AUDIO SETTINGS
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 py-4 pr-1">
          {/* Audio Controls */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Volume2 size={16} className="text-cyan-400" />
              <span>Audio Volumes</span>
            </h3>

            <div className="flex flex-col gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Master Volume</span>
                  <span>{Math.round(saveData.settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={saveData.settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>BGM Music (Procedural Synthwave)</span>
                  <span>{Math.round(saveData.settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={saveData.settings.musicVolume}
                  onChange={(e) => updateSetting('musicVolume', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Sound Effects (SFX)</span>
                  <span>{Math.round(saveData.settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={saveData.settings.sfxVolume}
                  onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Graphics Quality */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Monitor size={16} className="text-yellow-400" />
              <span>Graphics Quality Preset</span>
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    audio.playClick();
                    updateSetting('graphicsQuality', q);
                  }}
                  className={`py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    saveData.settings.graphicsQuality === q
                      ? 'bg-yellow-500 text-slate-950 border-yellow-300 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile & Controls */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Smartphone size={16} className="text-emerald-400" />
              <span>Touch & Display Controls</span>
            </h3>

            <div className="flex flex-col gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">On-Screen Touch Buttons</div>
                  <div className="text-[11px] text-slate-400">Display virtual D-Pad and Jump/Slide buttons</div>
                </div>

                <button
                  onClick={() => {
                    audio.playClick();
                    updateSetting('showOnScreenControls', !saveData.settings.showOnScreenControls);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    saveData.settings.showOnScreenControls ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      saveData.settings.showOnScreenControls ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Fullscreen Button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">Display Fullscreen</div>
                  <div className="text-[11px] text-slate-400">Maximize canvas to screen border</div>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 size={14} />
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* PC Keyboard Guide */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              PC Keyboard Controls:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div><strong className="text-yellow-400">SPACE / W / UP</strong> : Jump</div>
              <div><strong className="text-amber-400">S / DOWN</strong> : Slide</div>
              <div><strong className="text-cyan-400">A / LEFT</strong> : Move Left</div>
              <div><strong className="text-cyan-400">D / RIGHT</strong> : Move Right</div>
              <div><strong className="text-rose-400">DOUBLE TAP / CLICK</strong> : Deploy Board</div>
              <div><strong className="text-slate-400">ESC</strong> : Pause</div>
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleResetData}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                confirmReset
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800'
              }`}
            >
              <Trash2 size={14} />
              <span>{confirmReset ? 'CONFIRM RESET ALL DATA?' : 'Reset All Game Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
