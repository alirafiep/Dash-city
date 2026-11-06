import React, { useState } from 'react';
import { X, Check, Lock, Flame, Zap, Magnet, Shield, ArrowUpCircle, ShoppingBag, Plus } from 'lucide-react';
import { HOVERBOARDS } from '../game/storage';
import { GameSaveData, HoverboardDef } from '../game/types';
import { audio } from '../game/audio';

interface ShopModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ saveData, onUpdateSave, onClose }) => {
  const [tab, setTab] = useState<'HOVERBOARDS' | 'UPGRADES' | 'SUPPLIES'>('HOVERBOARDS');

  // Hoverboard Actions
  const handleEquipBoard = (board: HoverboardDef) => {
    audio.playClick();
    onUpdateSave({
      ...saveData,
      selectedHoverboard: board.id,
    });
  };

  const handleBuyBoard = (board: HoverboardDef) => {
    if (board.priceCoins && saveData.coins >= board.priceCoins) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        coins: saveData.coins - board.priceCoins,
        unlockedHoverboards: [...saveData.unlockedHoverboards, board.id],
        selectedHoverboard: board.id,
      });
    } else if (board.priceDiamonds && saveData.diamonds >= board.priceDiamonds) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        diamonds: saveData.diamonds - board.priceDiamonds,
        unlockedHoverboards: [...saveData.unlockedHoverboards, board.id],
        selectedHoverboard: board.id,
      });
    }
  };

  // Power-up Upgrades
  const handleUpgradePowerUp = (type: keyof typeof saveData.powerUpLevels) => {
    const currentLvl = saveData.powerUpLevels[type];
    if (currentLvl >= 5) return;

    const costCoins = currentLvl * 1000;
    if (saveData.coins >= costCoins) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        coins: saveData.coins - costCoins,
        powerUpLevels: {
          ...saveData.powerUpLevels,
          [type]: currentLvl + 1,
        },
      });
    }
  };

  // Buy Hoverboard consumables
  const handleBuyBoardsStock = (qty: number, cost: number) => {
    if (saveData.coins >= cost) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        coins: saveData.coins - cost,
        hoverboardsStock: saveData.hoverboardsStock + qty,
      });
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl h-[90vh] bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-cyan-400" size={24} />
            <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
              CITY RUNNER SHOP & GEAR
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Balances */}
            <div className="flex items-center gap-2 bg-slate-850 px-3 py-1 rounded-xl border border-slate-700 text-xs font-bold">
              <span className="text-amber-400">🪙 {saveData.coins.toLocaleString()}</span>
              <span>•</span>
              <span className="text-cyan-400">💎 {saveData.diamonds.toLocaleString()}</span>
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
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
          <button
            onClick={() => {
              audio.playClick();
              setTab('HOVERBOARDS');
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'HOVERBOARDS'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame size={16} />
            <span>Hoverboards</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setTab('UPGRADES');
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'UPGRADES'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap size={16} />
            <span>Power-Up Upgrades</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setTab('SUPPLIES');
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'SUPPLIES'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plus size={16} />
            <span>Supplies & Bundles</span>
          </button>
        </div>

        {/* Tab 1: Hoverboards */}
        {tab === 'HOVERBOARDS' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOVERBOARDS.map((board) => {
              const unlocked = saveData.unlockedHoverboards.includes(board.id);
              const isEquipped = saveData.selectedHoverboard === board.id;

              return (
                <div
                  key={board.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-slate-850 border-rose-500 shadow-xl shadow-rose-500/10'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black text-rose-400 uppercase tracking-wider">
                        {board.trailType} TRAIL
                      </div>
                      <h3 className="text-xl font-black font-arcade text-white tracking-wide mt-0.5">
                        {board.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xs">{board.description}</p>
                    </div>

                    <div
                      className="w-16 h-10 rounded-xl border-2 border-white/20 shadow-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(45deg, ${board.colorA}, ${board.colorB})`,
                      }}
                    >
                      <Flame size={20} className="text-white drop-shadow" />
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      {!unlocked ? (
                        <div className="text-sm font-black text-yellow-400">
                          {board.priceCoins ? `${board.priceCoins.toLocaleString()} 🪙` : `${board.priceDiamonds} 💎`}
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-emerald-400">UNLOCKED</div>
                      )}
                    </div>

                    {isEquipped ? (
                      <span className="text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl">
                        EQUIPPED
                      </span>
                    ) : unlocked ? (
                      <button
                        onClick={() => handleEquipBoard(board)}
                        className="text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyBoard(board)}
                        disabled={Boolean(
                          (board.priceCoins && saveData.coins < board.priceCoins) ||
                          (board.priceDiamonds && saveData.diamonds < board.priceDiamonds)
                        )}
                        className="text-xs font-black uppercase bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Upgrades */}
        {tab === 'UPGRADES' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coin Magnet Upgrade */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                    <Magnet size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Coin Magnet</h3>
                    <p className="text-xs text-slate-400">Pulls coins towards player from distance</p>
                  </div>
                </div>

                {/* Level Bars */}
                <div className="flex gap-1.5 mt-4">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2.5 flex-1 rounded-full ${
                        lvl <= saveData.powerUpLevels.magnet ? 'bg-pink-500' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold text-slate-400 mt-1">
                  Level {saveData.powerUpLevels.magnet} of 5 ({15 + saveData.powerUpLevels.magnet * 3}s duration)
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-yellow-400">
                  {saveData.powerUpLevels.magnet >= 5 ? 'MAX LEVEL' : `${saveData.powerUpLevels.magnet * 1000} 🪙`}
                </span>
                {saveData.powerUpLevels.magnet < 5 && (
                  <button
                    onClick={() => handleUpgradePowerUp('magnet')}
                    disabled={saveData.coins < saveData.powerUpLevels.magnet * 1000}
                    className="text-xs font-black uppercase bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* 2X Multiplier */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">2X Multiplier</h3>
                    <p className="text-xs text-slate-400">Doubles value of all collected gold coins</p>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-4">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2.5 flex-1 rounded-full ${
                        lvl <= saveData.powerUpLevels.doubleCoins ? 'bg-blue-500' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold text-slate-400 mt-1">
                  Level {saveData.powerUpLevels.doubleCoins} of 5 ({20 + saveData.powerUpLevels.doubleCoins * 4}s duration)
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-yellow-400">
                  {saveData.powerUpLevels.doubleCoins >= 5 ? 'MAX LEVEL' : `${saveData.powerUpLevels.doubleCoins * 1000} 🪙`}
                </span>
                {saveData.powerUpLevels.doubleCoins < 5 && (
                  <button
                    onClick={() => handleUpgradePowerUp('doubleCoins')}
                    disabled={saveData.coins < saveData.powerUpLevels.doubleCoins * 1000}
                    className="text-xs font-black uppercase bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* Crash Shield */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Crash Shield</h3>
                    <p className="text-xs text-slate-400">Protects runner from fatal train or barrier impact</p>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-4">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2.5 flex-1 rounded-full ${
                        lvl <= saveData.powerUpLevels.shield ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold text-slate-400 mt-1">
                  Level {saveData.powerUpLevels.shield} of 5 ({25 + saveData.powerUpLevels.shield * 5}s duration)
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-yellow-400">
                  {saveData.powerUpLevels.shield >= 5 ? 'MAX LEVEL' : `${saveData.powerUpLevels.shield * 1000} 🪙`}
                </span>
                {saveData.powerUpLevels.shield < 5 && (
                  <button
                    onClick={() => handleUpgradePowerUp('shield')}
                    disabled={saveData.coins < saveData.powerUpLevels.shield * 1000}
                    className="text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* Super Jump */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <ArrowUpCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Super Jump Sneakers</h3>
                    <p className="text-xs text-slate-400">Gives high leaps to easily vault onto train roofs</p>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-4">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2.5 flex-1 rounded-full ${
                        lvl <= saveData.powerUpLevels.superJump ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold text-slate-400 mt-1">
                  Level {saveData.powerUpLevels.superJump} of 5 ({15 + saveData.powerUpLevels.superJump * 3}s duration)
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-yellow-400">
                  {saveData.powerUpLevels.superJump >= 5 ? 'MAX LEVEL' : `${saveData.powerUpLevels.superJump * 1000} 🪙`}
                </span>
                {saveData.powerUpLevels.superJump < 5 && (
                  <button
                    onClick={() => handleUpgradePowerUp('superJump')}
                    disabled={saveData.coins < saveData.powerUpLevels.superJump * 1000}
                    className="text-xs font-black uppercase bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Supplies & Bundles */}
        {tab === 'SUPPLIES' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 3 Hoverboards Pack */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <Flame size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">3x Hoverboard Stock</h3>
                  <p className="text-xs text-slate-400">Instant crash defense in runs</p>
                </div>
              </div>

              <button
                onClick={() => handleBuyBoardsStock(3, 500)}
                disabled={saveData.coins < 500}
                className="text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl cursor-pointer shadow"
              >
                500 🪙
              </button>
            </div>

            {/* 10 Hoverboards Mega Pack */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Flame size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">10x Hoverboards Pack</h3>
                  <p className="text-xs text-slate-400">Best value runner bundle</p>
                </div>
              </div>

              <button
                onClick={() => handleBuyBoardsStock(10, 1400)}
                disabled={saveData.coins < 1400}
                className="text-xs font-black uppercase bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl cursor-pointer shadow"
              >
                1,400 🪙
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
