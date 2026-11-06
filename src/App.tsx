/**
 * Dash City: Escape Run – 3D Endless Runner
 * Inspired by Subway Surfers – Complete Mobile + PC 3D Game
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DashEngine } from './game/engine';
import { audio } from './game/audio';
import {
  getTodayDateString,
  loadGameData,
  saveGameData,
} from './game/storage';
import {
  GameMode,
  GameSaveData,
  GameState,
  PowerUpActiveState,
} from './game/types';

import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { ShopModal } from './components/ShopModal';
import { LuckySpinModal } from './components/LuckySpinModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { MissionsModal } from './components/MissionsModal';
import { RedeemCodeModal } from './components/RedeemCodeModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';

type ActiveModal =
  | 'NONE'
  | 'CHARACTERS'
  | 'SHOP'
  | 'LUCKY_SPIN'
  | 'DAILY_REWARDS'
  | 'MISSIONS'
  | 'REDEEM_CODES'
  | 'LEADERBOARD'
  | 'SETTINGS';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DashEngine | null>(null);

  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameData());
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [activeModal, setActiveModal] = useState<ActiveModal>('NONE');
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>('ENDLESS');

  // Real-time HUD State
  const [hudScore, setHudScore] = useState(0);
  const [hudCoins, setHudCoins] = useState(0);
  const [hudDiamonds, setHudDiamonds] = useState(0);
  const [hudDistance, setHudDistance] = useState(0);
  const [hudMultiplier, setHudMultiplier] = useState(1);
  const [hudPowerUps, setHudPowerUps] = useState<PowerUpActiveState>({
    magnet: 0,
    superJump: 0,
    superSpeed: 0,
    powerPunch: 0,
    jetpack: 0,
    shield: 0,
    doubleCoins: 0,
    hoverboard: 0,
  });
  const [hudPoliceWarning, setHudPoliceWarning] = useState(false);

  // Game Over Details
  const [gameOverSummary, setGameOverSummary] = useState<{
    score: number;
    coins: number;
    diamonds: number;
    distance: number;
    highScore: boolean;
    reason: string;
  } | null>(null);

  // Sync state to storage
  const handleUpdateSave = useCallback((updated: GameSaveData) => {
    setSaveData(updated);
    saveGameData(updated);
    if (engineRef.current) {
      engineRef.current.updateSettings(updated);
    }
  }, []);

  // Daily Login Streak Check on mount
  useEffect(() => {
    const today = getTodayDateString();
    if (saveData.lastLoginDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      let newStreak = saveData.dailyStreak;
      if (saveData.lastLoginDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // broken streak
      }

      handleUpdateSave({
        ...saveData,
        dailyStreak: newStreak,
        lastLoginDate: today,
        // Reset claimed list if new cycle begins
        claimedDailyDays: newStreak % 7 === 1 ? [] : saveData.claimedDailyDays,
      });
    }

    // Initialize audio volumes
    audio.setVolumes(
      saveData.settings.masterVolume,
      saveData.settings.musicVolume,
      saveData.settings.sfxVolume
    );
  }, []);

  // Handle Mission Progress Tracker
  const handleMissionProgress = useCallback((type: string, amount: number) => {
    setSaveData((prev) => {
      let changed = false;
      const updatedMissions = prev.missions.map((m) => {
        if (m.type === type && !m.completed) {
          const next = m.current + amount;
          changed = true;
          return {
            ...m,
            current: next,
            completed: next >= m.target,
          };
        }
        return m;
      });

      if (!changed) return prev;
      const nextSave = { ...prev, missions: updatedMissions };
      saveGameData(nextSave);
      return nextSave;
    });
  }, []);

  // Start or Restart Game
  const startGame = useCallback((mode: GameMode = 'ENDLESS') => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    setCurrentGameMode(mode);
    setGameState('PLAYING');
    setActiveModal('NONE');
    setGameOverSummary(null);

    if (canvasMountRef.current) {
      const engine = new DashEngine(
        canvasMountRef.current,
        saveData,
        {
          onScoreUpdate: (state) => {
            setHudScore(state.score);
            setHudCoins(state.coins);
            setHudDiamonds(state.diamonds);
            setHudDistance(state.distance);
            setHudMultiplier(state.multiplier);
            setHudPowerUps(state.powerUps);
            setHudPoliceWarning(state.policeWarning);
          },
          onGameOver: (summary) => {
            setGameState('GAMEOVER');
            setGameOverSummary(summary);

            // Update career stats & high scores
            setSaveData((prev) => {
              const newCoins = prev.coins + summary.coins;
              const newDiamonds = prev.diamonds + summary.diamonds;
              const newBestScore = Math.max(prev.highScore, summary.score);

              const next = {
                ...prev,
                coins: newCoins,
                diamonds: newDiamonds,
                highScore: newBestScore,
                stats: {
                  ...prev.stats,
                  totalRuns: prev.stats.totalRuns + 1,
                  totalDistance: prev.stats.totalDistance + summary.distance,
                  totalCoinsCollected: prev.stats.totalCoinsCollected + summary.coins,
                  totalDiamondsCollected: prev.stats.totalDiamondsCollected + summary.diamonds,
                  bestScore: newBestScore,
                },
              };
              saveGameData(next);
              return next;
            });
          },
          onMissionProgress: handleMissionProgress,
        },
        mode
      );

      engineRef.current = engine;
    }
  }, [saveData, handleMissionProgress]);

  // Pause & Resume
  const handlePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      audio.playClick();
      setGameState('PAUSED');
      engineRef.current?.pause();
    }
  }, [gameState]);

  const handleResume = useCallback(() => {
    audio.playClick();
    setGameState('PLAYING');
    engineRef.current?.resume();
  }, []);

  const handleRevive = useCallback(() => {
    if (saveData.diamonds >= 5 && engineRef.current) {
      handleUpdateSave({
        ...saveData,
        diamonds: saveData.diamonds - 5,
      });
      setGameState('PLAYING');
      setGameOverSummary(null);
      engineRef.current.revive();
    }
  }, [saveData, handleUpdateSave]);

  const handleQuitToMenu = useCallback(() => {
    audio.playClick();
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    setGameState('MENU');
    setGameOverSummary(null);
  }, []);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') {
        if (e.code === 'Escape' && gameState === 'PAUSED') {
          handleResume();
        }
        return;
      }

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        engineRef.current?.moveLeft();
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        engineRef.current?.moveRight();
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault();
        engineRef.current?.jump();
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        engineRef.current?.slide();
      } else if (e.code === 'KeyF' || e.code === 'KeyE') {
        e.preventDefault();
        engineRef.current?.punch();
      } else if (e.code === 'Escape') {
        handlePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handlePause, handleResume]);

  // Mobile Swipe Gesture Listeners
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'PLAYING') return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };

    // Double tap detection to deploy hoverboard!
    const now = Date.now();
    if (now - lastTapTime.current < 280) {
      engineRef.current?.activateHoverboard();
    }
    lastTapTime.current = now;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || gameState !== 'PLAYING') return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 28 * saveData.settings.swipeSensitivity;

    if (Math.max(absX, absY) > threshold) {
      if (absX > absY) {
        // Horizontal Swipe
        if (dx > 0) engineRef.current?.moveRight();
        else engineRef.current?.moveLeft();
      } else {
        // Vertical Swipe
        if (dy > 0) engineRef.current?.slide();
        else engineRef.current?.jump();
      }
    }
    touchStartPos.current = null;
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          saveData={saveData}
          onPlay={startGame}
          onOpenCharacters={() => setActiveModal('CHARACTERS')}
          onOpenShop={() => setActiveModal('SHOP')}
          onOpenLuckySpin={() => setActiveModal('LUCKY_SPIN')}
          onOpenDailyRewards={() => setActiveModal('DAILY_REWARDS')}
          onOpenMissions={() => setActiveModal('MISSIONS')}
          onOpenRedeemCodes={() => setActiveModal('REDEEM_CODES')}
          onOpenLeaderboard={() => setActiveModal('LEADERBOARD')}
          onOpenSettings={() => setActiveModal('SETTINGS')}
        />
      )}

      {/* In-Game Active HUD Overlay */}
      {gameState === 'PLAYING' && (
        <GameHUD
          score={hudScore}
          highScore={saveData.highScore}
          coins={hudCoins}
          diamonds={hudDiamonds}
          distance={hudDistance}
          multiplier={hudMultiplier}
          powerUps={hudPowerUps}
          policeWarning={hudPoliceWarning}
          hoverboardsStock={saveData.hoverboardsStock}
          showOnScreenControls={saveData.settings.showOnScreenControls}
          onPause={handlePause}
          onDeployHoverboard={() => engineRef.current?.activateHoverboard()}
          onPunch={() => engineRef.current?.punch()}
          onMoveLeft={() => engineRef.current?.moveLeft()}
          onMoveRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
        />
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onDismiss={handleResume}
          onRestart={() => startGame(currentGameMode)}
          onMainMenu={handleQuitToMenu}
          isMuted={saveData.settings.masterVolume === 0}
          onToggleMute={() => {
            const newVol = saveData.settings.masterVolume === 0 ? 0.8 : 0;
            handleUpdateSave({
              ...saveData,
              settings: {
                ...saveData.settings,
                masterVolume: newVol,
              },
            });
          }}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && gameOverSummary && (
        <GameOverModal
          score={gameOverSummary.score}
          coins={gameOverSummary.coins}
          diamonds={gameOverSummary.diamonds}
          distance={gameOverSummary.distance}
          highScore={gameOverSummary.highScore}
          reason={gameOverSummary.reason}
          playerDiamonds={saveData.diamonds}
          onRevive={handleRevive}
          onRestart={() => startGame(currentGameMode)}
          onMainMenu={handleQuitToMenu}
        />
      )}

      {/* Modals */}
      {activeModal === 'CHARACTERS' && (
        <CharacterSelectModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'SHOP' && (
        <ShopModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'LUCKY_SPIN' && (
        <LuckySpinModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'DAILY_REWARDS' && (
        <DailyRewardsModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'MISSIONS' && (
        <MissionsModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'REDEEM_CODES' && (
        <RedeemCodeModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'LEADERBOARD' && (
        <LeaderboardModal
          saveData={saveData}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'SETTINGS' && (
        <SettingsModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal('NONE')}
        />
      )}
    </div>
  );
}
