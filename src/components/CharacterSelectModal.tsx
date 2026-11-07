import React, { useState } from 'react';
import { X, Check, Lock, Sparkles, Zap, Shield } from 'lucide-react';
import { CHARACTERS, OUTFITS } from '../game/storage';
import { CharacterDef, GameSaveData, OutfitDef } from '../game/types';
import { audio } from '../game/audio';

interface CharacterSelectModalProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(saveData.selectedCharacter);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CARTOON' | 'HUMAN' | 'LEGENDARY'>('ALL');

  const activeChar = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
  const isUnlocked = saveData.unlockedCharacters.includes(activeChar.id);
  const isEquipped = saveData.selectedCharacter === activeChar.id;

  // Filtered characters
  const displayedCharacters = CHARACTERS.filter((c) => {
    if (filterCategory === 'CARTOON') return c.gender === 'cartoon';
    if (filterCategory === 'HUMAN') return c.gender === 'male' || c.gender === 'female';
    if (filterCategory === 'LEGENDARY') return c.gender === 'legendary';
    return true;
  });

  // Outfits for active character
  const availableOutfits = OUTFITS.filter((o) => o.characterId === activeChar.id);
  const activeOutfitId = saveData.selectedOutfit[activeChar.id] || `${activeChar.id}_default`;

  const handleSelectCharacter = (char: CharacterDef) => {
    audio.playClick();
    setSelectedCharId(char.id);
  };

  const handleEquipCharacter = () => {
    audio.playClick();
    onUpdateSave({
      ...saveData,
      selectedCharacter: activeChar.id,
    });
  };

  const handleBuyCharacter = () => {
    if (activeChar.priceCoins && saveData.coins >= activeChar.priceCoins) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        coins: saveData.coins - activeChar.priceCoins,
        unlockedCharacters: [...saveData.unlockedCharacters, activeChar.id],
        selectedCharacter: activeChar.id,
      });
    } else if (activeChar.priceDiamonds && saveData.diamonds >= activeChar.priceDiamonds) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        diamonds: saveData.diamonds - activeChar.priceDiamonds,
        unlockedCharacters: [...saveData.unlockedCharacters, activeChar.id],
        selectedCharacter: activeChar.id,
      });
    }
  };

  const handleEquipOutfit = (outfit: OutfitDef) => {
    audio.playClick();
    onUpdateSave({
      ...saveData,
      selectedOutfit: {
        ...saveData.selectedOutfit,
        [activeChar.id]: outfit.id,
      },
    });
  };

  const handleBuyOutfit = (outfit: OutfitDef) => {
    if (outfit.priceCoins && saveData.coins >= outfit.priceCoins) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        coins: saveData.coins - outfit.priceCoins,
        unlockedOutfits: [...saveData.unlockedOutfits, outfit.id],
        selectedOutfit: {
          ...saveData.selectedOutfit,
          [activeChar.id]: outfit.id,
        },
      });
    } else if (outfit.priceDiamonds && saveData.diamonds >= outfit.priceDiamonds) {
      audio.playVictory();
      onUpdateSave({
        ...saveData,
        diamonds: saveData.diamonds - outfit.priceDiamonds,
        unlockedOutfits: [...saveData.unlockedOutfits, outfit.id],
        selectedOutfit: {
          ...saveData.selectedOutfit,
          [activeChar.id]: outfit.id,
        },
      });
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl h-[92vh] bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={24} />
            <h2 className="text-xl md:text-2xl font-black font-arcade uppercase text-white tracking-wide">
              RUNNER SELECTION & OUTFITS
            </h2>
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

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Left: Characters Roster (md:col-span-5) */}
          <div className="md:col-span-5 p-4 border-r border-slate-800 flex flex-col gap-2.5">
            {/* Filter Pills */}
            <div className="grid grid-cols-4 gap-1 mb-1">
              {(['ALL', 'CARTOON', 'HUMAN', 'LEGENDARY'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    audio.playClick();
                    setFilterCategory(cat);
                  }}
                  className={`py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat === 'CARTOON' ? '🍌 CARTOON' : cat}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Select Character
            </span>

            {displayedCharacters.map((char) => {
              const unlocked = saveData.unlockedCharacters.includes(char.id);
              const isSelected = selectedCharId === char.id;
              const equipped = saveData.selectedCharacter === char.id;

              return (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400/90 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-md relative shrink-0"
                      style={{ backgroundColor: char.primaryColor }}
                    >
                      {char.avatarEmoji || char.name[0]}
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                          <Lock size={16} className="text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm md:text-base text-white flex items-center gap-1.5">
                        {char.name}
                        {char.gender === 'cartoon' && (
                          <span className="bg-lime-500/20 text-lime-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-lime-500/40">
                            CARTOON
                          </span>
                        )}
                        {char.gender === 'legendary' && (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-500/40">
                            LEGENDARY
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{char.tagline}</div>
                    </div>
                  </div>

                  {equipped ? (
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-1 rounded-full">
                      EQUIPPED
                    </span>
                  ) : !unlocked ? (
                    <span className="text-xs font-bold text-yellow-400">
                      {char.priceCoins ? `${char.priceCoins} 🪙` : `${char.priceDiamonds} 💎`}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Right: Character Details & Outfits (md:col-span-7) */}
          <div className="md:col-span-7 p-4 md:p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Hero Banner */}
              <div
                className="w-full rounded-3xl p-5 border shadow-xl flex items-center justify-between"
                style={{
                  background: `linear-gradient(135deg, ${activeChar.primaryColor}22 0%, #0f172a 100%)`,
                  borderColor: activeChar.primaryColor,
                }}
              >
                <div>
                  <div className="text-xs font-black tracking-widest text-slate-400 uppercase">
                    {activeChar.gender} RUNNER
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black font-arcade text-white tracking-wide mt-0.5">
                    {activeChar.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">{activeChar.tagline}</p>

                  {/* Funny Cartoon Quote Speech Bubble */}
                  {activeChar.funnyQuote && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-yellow-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-2xl shadow-md border-2 border-yellow-300">
                      <span>💬</span>
                      <span>"{activeChar.funnyQuote}"</span>
                    </div>
                  )}
                </div>

                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl border-2 border-white/20 shrink-0"
                  style={{ backgroundColor: activeChar.primaryColor }}
                >
                  {activeChar.avatarEmoji || activeChar.name[0]}
                </div>
              </div>

              {/* Unique Perk */}
              <div className="mt-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
                <Zap className="text-yellow-400 mt-0.5 shrink-0" size={18} />
                <div>
                  <div className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                    SPECIAL ABILITY PERK
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">
                    {activeChar.perkDescription}
                  </div>
                </div>
              </div>

              {/* Outfits Collection */}
              <div className="mt-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Costumes & Outfits
                </span>

                {availableOutfits.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3">Original Outfit equipped by default.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableOutfits.map((outfit) => {
                      const outfitUnlocked =
                        !outfit.priceCoins && !outfit.priceDiamonds
                          ? true
                          : saveData.unlockedOutfits.includes(outfit.id);
                      const isCurrentOutfit = activeOutfitId === outfit.id;

                      return (
                        <div
                          key={outfit.id}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            isCurrentOutfit
                              ? 'bg-slate-800 border-cyan-400/80 shadow-md'
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg border border-white/20"
                              style={{ backgroundColor: outfit.jacketColor }}
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{outfit.name}</div>
                              {!outfitUnlocked && (
                                <div className="text-[10px] text-yellow-400 font-semibold">
                                  {outfit.priceCoins ? `${outfit.priceCoins} 🪙` : `${outfit.priceDiamonds} 💎`}
                                </div>
                              )}
                            </div>
                          </div>

                          {isCurrentOutfit ? (
                            <span className="text-[10px] font-black text-cyan-400">EQUIPPED</span>
                          ) : outfitUnlocked ? (
                            <button
                              onClick={() => handleEquipOutfit(outfit)}
                              className="text-xs font-bold bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-lg text-white cursor-pointer"
                            >
                              Equip
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyOutfit(outfit)}
                              className="text-xs font-bold bg-amber-600 hover:bg-amber-500 px-2.5 py-1 rounded-lg text-white cursor-pointer"
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Button for Character */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              {isEquipped ? (
                <div className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest uppercase bg-slate-800 text-emerald-400 border border-emerald-500/40 flex items-center justify-center gap-2">
                  <Check size={18} />
                  <span>CURRENTLY ACTIVE RUNNER</span>
                </div>
              ) : isUnlocked ? (
                <button
                  onClick={handleEquipCharacter}
                  className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-98 text-white shadow-xl shadow-emerald-600/30 border border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={18} />
                  <span>EQUIP {activeChar.name.toUpperCase()}</span>
                </button>
              ) : (
                <button
                  onClick={handleBuyCharacter}
                  disabled={Boolean(
                    (activeChar.priceCoins && saveData.coins < activeChar.priceCoins) ||
                    (activeChar.priceDiamonds && saveData.diamonds < activeChar.priceDiamonds)
                  )}
                  className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-98 text-slate-950 shadow-xl shadow-amber-600/30 border border-amber-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Lock size={18} />
                  <span>
                    UNLOCK FOR{' '}
                    {activeChar.priceCoins
                      ? `${activeChar.priceCoins.toLocaleString()} COINS`
                      : `${activeChar.priceDiamonds} DIAMONDS`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
