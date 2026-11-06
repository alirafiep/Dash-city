import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../game/audio';

interface PauseModalProps {
  onDismiss: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onDismiss,
  onRestart,
  onMainMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-black font-arcade uppercase text-white tracking-widest mb-6">
          GAME PAUSED
        </h2>

        <div className="flex flex-col gap-3 w-full">
          {/* Resume */}
          <button
            onClick={() => {
              audio.playClick();
              onDismiss();
            }}
            className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-98 text-white shadow-xl shadow-emerald-600/30 border border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={18} className="fill-white" />
            <span>RESUME RUN</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl font-bold text-sm tracking-wider uppercase bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-600 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>RESTART</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              audio.playClick();
              onToggleMute();
            }}
            className="w-full py-3 rounded-2xl font-bold text-sm tracking-wider uppercase bg-slate-800/80 hover:bg-slate-700 active:scale-98 text-slate-300 border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              audio.playClick();
              onMainMenu();
            }}
            className="w-full py-3 rounded-2xl font-bold text-sm tracking-wider uppercase bg-slate-900 hover:bg-slate-800 active:scale-98 text-slate-400 hover:text-white border border-slate-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Home size={16} />
            <span>QUIT TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
