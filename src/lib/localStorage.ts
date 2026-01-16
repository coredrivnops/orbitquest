// LocalStorage Manager for OrbitQuest
// Handles Stardust balance, unlocks, and high scores

import { PlayerProgress } from './gameTypes';

const STORAGE_KEY = 'orbitquest_progress';

const DEFAULT_PROGRESS: PlayerProgress = {
    stardust: 0,
    unlockedPlanets: ['pluto'], // Pluto is FREE - it's not a planet!
    highScores: {},
    lastPlayed: null,
    hasPlayedFirstGame: false,
};

/**
 * Load player progress from localStorage
 */
export function loadProgress(): PlayerProgress {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved) as PlayerProgress;
            // Ensure pluto is always unlocked (it's FREE!)
            if (!parsed.unlockedPlanets.includes('pluto')) {
                parsed.unlockedPlanets.push('pluto');
            }
            // Migrate old saves that started with neptune
            if (parsed.unlockedPlanets.includes('neptune') && !parsed.hasPlayedFirstGame) {
                parsed.hasPlayedFirstGame = true;
            }
            return parsed;
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
    }

    return DEFAULT_PROGRESS;
}

/**
 * Save player progress to localStorage
 */
export function saveProgress(progress: PlayerProgress): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Failed to save progress:', error);
    }
}

/**
 * Mark that player has played their first game
 */
export function markFirstGamePlayed(): PlayerProgress {
    const progress = loadProgress();
    if (!progress.hasPlayedFirstGame) {
        progress.hasPlayedFirstGame = true;
        saveProgress(progress);
    }
    return progress;
}

/**
 * Add Stardust to player balance
 */
export function addStardust(amount: number): PlayerProgress {
    const progress = loadProgress();
    progress.stardust += amount;
    progress.lastPlayed = new Date().toISOString();
    progress.hasPlayedFirstGame = true; // Mark as played when earning stardust
    saveProgress(progress);
    return progress;
}

/**
 * Attempt to unlock a planet
 * Returns true if successful, false if not enough Stardust
 */
export function unlockPlanet(planetId: string, cost: number): { success: boolean; progress: PlayerProgress } {
    const progress = loadProgress();

    if (progress.unlockedPlanets.includes(planetId)) {
        return { success: true, progress }; // Already unlocked
    }

    // Pluto is always free
    if (planetId === 'pluto') {
        progress.unlockedPlanets.push('pluto');
        saveProgress(progress);
        return { success: true, progress };
    }

    if (progress.stardust < cost) {
        return { success: false, progress }; // Not enough Stardust
    }

    progress.stardust -= cost;
    progress.unlockedPlanets.push(planetId);
    saveProgress(progress);

    return { success: true, progress };
}

/**
 * Update high score for a planet
 * Returns true if new high score was set
 */
export function updateHighScore(planetId: string, score: number): boolean {
    const progress = loadProgress();
    const currentHigh = progress.highScores[planetId] || 0;

    if (score > currentHigh) {
        progress.highScores[planetId] = score;
        progress.hasPlayedFirstGame = true;
        saveProgress(progress);
        return true;
    }

    return false;
}

/**
 * Check if a planet is unlocked
 */
export function isPlanetUnlocked(planetId: string): boolean {
    const progress = loadProgress();
    return progress.unlockedPlanets.includes(planetId);
}

/**
 * Get current Stardust balance
 */
export function getStardustBalance(): number {
    return loadProgress().stardust;
}

/**
 * Check if player has started playing
 */
export function hasStartedPlaying(): boolean {
    return loadProgress().hasPlayedFirstGame || false;
}

/**
 * Reset all progress (for debugging)
 */
export function resetProgress(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
