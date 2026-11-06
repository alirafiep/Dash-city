import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Check, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import { GameSaveData, RedeemCodeResult } from '../game/types';
import { redeemCode, saveCustomCode } from '../game/storage';
import { audio } from '../game/audio';

interface RedeemCodeModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onClose: () => void;
}

export const RedeemCodeModal: React.FC<RedeemCodeModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [tab, setTab] = useState<'REDEEM' | 'ADMIN'>('REDEEM');
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Admin Creator Form
  const [adminCode, setAdminCode] = useState('');
  const [adminCoins, setAdminCoins] = useState(1000);
  const [adminDiamonds, setAdminDiamonds] = useState(25);
  const [adminHoverboards, setAdminHoverboards] = useState(3);
  const [adminSuccess, setAdminSuccess] = useState('');

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const { result, updatedData } = redeemCode(inputCode, saveData);

    if (result.success) {
      audio.playVictory();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      setMessage({ text: result.message, type: 'success' });
      onUpdateSave(updatedData);
      setInputCode('');
    } else {
      audio.playCollision();
      setMessage({ text: result.message, type: 'error' });
    }
  };

  const handleCreateAdminCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode.trim()) return;

    const saved = saveCustomCode({
      code: adminCode.trim().toUpperCase(),
      coins: Number(adminCoins) || 0,
      diamonds: Number(adminDiamonds) || 0,
      hoverboards: Number(adminHoverboards) || 0,
    });

    if (saved) {
      audio.playClick();
      setAdminSuccess(`Created code "${adminCode.toUpperCase()}"! You or players can redeem it now.`);
      setAdminCode('');
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gift className="text-yellow-400" size={24} />
            <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
              REDEEM SECRET CODES
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 my-3 rounded-2xl">
          <button
            onClick={() => {
              audio.playClick();
              setTab('REDEEM');
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'REDEEM'
                ? 'bg-yellow-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gift size={16} />
            <span>Redeem Code</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setTab('ADMIN');
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Admin Code Creator</span>
          </button>
        </div>

        {tab === 'REDEEM' ? (
          <div>
            <p className="text-xs text-slate-400 mb-4">
              Enter official promotional codes below to receive free Coins, Diamonds, Characters, and Outfits!
            </p>

            <form onSubmit={handleRedeem} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. DASH100)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-950/90 border border-slate-700 rounded-2xl px-4 py-3 text-white font-mono font-bold uppercase tracking-wider focus:outline-hidden focus:border-yellow-400"
                />
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-slate-950 font-black uppercase text-xs md:text-sm px-6 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 cursor-pointer"
                >
                  CLAIM
                </button>
              </div>

              {/* Message Banner */}
              {message && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                  }`}
                >
                  {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{message.text}</span>
                </div>
              )}
            </form>

            {/* Quick Sample Codes List */}
            <div className="mt-5 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                Available Working Codes:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { code: 'DASH100', desc: '1,000 Coins' },
                  { code: 'DIAMOND50', desc: '50 Diamonds' },
                  { code: 'SUPERPLAYER', desc: 'Unlock Nova & 25💎' },
                  { code: 'FREERUN', desc: 'Neon Outfit & 1.5K' },
                  { code: 'BOOST2026', desc: 'Mega Booster Pack' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setInputCode(item.code)}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-yellow-400/50 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-mono font-black text-yellow-300">{item.code}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Admin Code Creator */
          <div>
            <p className="text-xs text-slate-400 mb-3">
              As an administrator, you can generate brand-new promotional gift codes with custom Coin and Diamond rewards!
            </p>

            <form onSubmit={handleCreateAdminCode} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">PROMO CODE NAME</label>
                <input
                  type="text"
                  placeholder="e.g. MEGA2026"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-indigo-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">COINS (🪙)</label>
                  <input
                    type="number"
                    value={adminCoins}
                    onChange={(e) => setAdminCoins(Number(e.target.value))}
                    className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">DIAMONDS (💎)</label>
                  <input
                    type="number"
                    value={adminDiamonds}
                    onChange={(e) => setAdminDiamonds(Number(e.target.value))}
                    className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">BOARDS (🛹)</label>
                  <input
                    type="number"
                    value={adminHoverboards}
                    onChange={(e) => setAdminHoverboards(Number(e.target.value))}
                    className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-rose-300 font-mono"
                  />
                </div>
              </div>

              {adminSuccess && (
                <div className="p-3 bg-indigo-950/60 border border-indigo-500/50 rounded-xl text-xs text-indigo-200">
                  {adminSuccess}
                </div>
              )}

              <button
                type="submit"
                className="mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={16} /> Create Code
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
