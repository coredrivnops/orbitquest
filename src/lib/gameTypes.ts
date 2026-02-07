// Game and planet type definitions

export interface Planet {
    id: string;
    name: string;
    gameName: string;
    description: string;
    stardustCost: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    color: string;
    glowColor: string;
    educationalTopic: string;
    order: number; // Journey order (0 = Pluto special, 1 = Neptune start)
    isBonus?: boolean; // Optional post-game content
    isSpecial?: boolean; // Special non-planet (Pluto, Moon)
    isHidden?: boolean; // Hidden until unlocked (surprise!)
    isMasterChallenge?: boolean; // Ultimate challenge - unlocks everything
    isBossChallenge?: boolean; // Boss challenge - unlocks ONLY after playing all games
    tagline?: string; // Fun tagline for special worlds
    gameMode?: 'trivia' | 'arcade'; // Type of game (default: trivia)
}

export interface GameState {
    isPlaying: boolean;
    isPaused: boolean;
    score: number;
    level: number;
    lives: number;
}

export interface PlayerProgress {
    stardust: number;
    unlockedPlanets: string[];
    highScores: Record<string, number>;
    lastPlayed: string | null;
    hasPlayedFirstGame?: boolean; // Track if user has played at least once
    gamesPlayedAtLeastOnce?: string[]; // Track games played at least once for boss challenge unlock
}


// Journey: Pluto (FREE) → Neptune → Uranus → Saturn → Jupiter → Mars → Moon → Earth → Venus → Mercury
export const PLANETS: Planet[] = [
    {
        id: 'pluto',
        name: 'Pluto',
        gameName: 'Dwarf Dash',
        description: 'FREE because it\'s not a planet! Start your journey from the frozen edge of the Kuiper Belt.',
        stardustCost: 0, // FREE - not a planet joke!
        difficulty: 'easy',
        color: '#a78bfa',
        glowColor: '#c4b5fd',
        educationalTopic: 'Dwarf planet status, Kuiper Belt, New Horizons',
        order: 0,
        isSpecial: true,
        tagline: '🎉 FREE because scientists said "You\'re not a planet!" in 2006',
    },
    {
        id: 'neptune',
        name: 'Neptune',
        gameName: 'Deep Dive',
        description: 'The journey truly begins. Navigate the supersonic winds at 2,000 km/h.',
        stardustCost: 100,
        difficulty: 'easy',
        color: '#3b82f6',
        glowColor: '#60a5fa',
        educationalTopic: 'Supersonic winds, Great Dark Spot',
        order: 1,
    },
    {
        id: 'uranus',
        name: 'Uranus',
        gameName: 'Polar Night',
        description: 'Red Light, Green Light in space! Move during Summer, freeze during Winter.',
        stardustCost: 150,
        difficulty: 'easy',
        color: '#06b6d4',
        glowColor: '#22d3ee',
        educationalTopic: '98° axial tilt, 42-year seasons',
        order: 2,
    },
    {
        id: 'saturn',
        name: 'Saturn',
        gameName: 'Ring Runner',
        description: 'The jewel of the system. Leap across the icy rings, mind the gaps.',
        stardustCost: 400,
        difficulty: 'medium',
        color: '#eab308',
        glowColor: '#facc15',
        educationalTopic: 'Ring composition, Roche limit',
        order: 3,
    },
    {
        id: 'jupiter',
        name: 'Jupiter',
        gameName: 'Gravity Slingshot',
        description: 'The giant awaits. Use its massive gravity to slingshot through the storm.',
        stardustCost: 800,
        difficulty: 'medium',
        color: '#f97316',
        glowColor: '#fb923c',
        educationalTopic: 'Gas giant, metallic hydrogen, Great Red Spot',
        order: 4,
    },
    {
        id: 'mars',
        name: 'Mars',
        gameName: 'Rover Rally',
        description: 'Red rocks and dust storms. Guide the rover across treacherous terrain.',
        stardustCost: 1500,
        difficulty: 'medium',
        color: '#dc2626',
        glowColor: '#f87171',
        educationalTopic: 'Low gravity, Olympus Mons, rover missions',
        order: 5,
    },
    {
        id: 'moon',
        name: 'The Moon',
        gameName: 'Lunar Lander',
        description: '🌙 SURPRISE! You can\'t reach Earth without passing its faithful companion. Land safely!',
        stardustCost: 2000,
        difficulty: 'medium',
        color: '#9ca3af',
        glowColor: '#d1d5db',
        educationalTopic: 'Tidal locking, Apollo missions, lunar phases',
        order: 6,
        isSpecial: true,
        isHidden: true, // SURPRISE! Only revealed after Mars
        tagline: '🌙 Earth\'s loyal companion since 4.5 billion years ago',
    },
    {
        id: 'earth',
        name: 'Earth',
        gameName: 'Orbital Balance',
        description: 'HOME! Maintain stable orbit and complete your epic journey.',
        stardustCost: 2500,
        difficulty: 'hard',
        color: '#1d4ed8',
        glowColor: '#60a5fa',
        educationalTopic: 'Orbital mechanics, Kepler\'s laws',
        order: 7,
    },
    {
        id: 'venus',
        name: 'Venus',
        gameName: 'Pressure Dive',
        description: 'BONUS: The hellscape next door. Survive the crushing pressure.',
        stardustCost: 4000,
        difficulty: 'hard',
        color: '#f59e0b',
        glowColor: '#fbbf24',
        educationalTopic: 'Runaway greenhouse, sulfuric acid',
        order: 8,
        isBonus: true,
    },
    {
        id: 'mercury',
        name: 'Mercury',
        gameName: 'Solar Flare',
        description: 'BONUS: The ultimate test. Survive the sun\'s wrath on the scorched frontier.',
        stardustCost: 6000,
        difficulty: 'hard',
        color: '#9ca3af',
        glowColor: '#d1d5db',
        educationalTopic: 'Solar proximity, extreme temperatures',
        order: 9,
        isBonus: true,
    },
    {
        id: 'blackhole',
        name: 'Black Hole',
        gameName: 'Event Horizon',
        description: '🏆 MASTER CHALLENGE: Escape the most powerful force in the universe! Complete this to unlock ALL planets instantly!',
        stardustCost: 0, // Always accessible
        difficulty: 'hard',
        color: '#a855f7',
        glowColor: '#c084fc',
        educationalTopic: 'Event horizon, time dilation, Hawking radiation, gravitational lensing',
        order: 99, // Special - not in main journey
        isSpecial: true,
        isMasterChallenge: true, // Unique flag for the master challenge
        tagline: '🏆 Escape to unlock EVERYTHING!',
    },
    {
        id: 'sun',
        name: 'The Sun',
        gameName: 'Solar Showdown',
        description: '☀️ FINAL BOSS: The alien armada approaches! Command your astronaut squadron to defend the heart of our solar system in this epic arcade battle! Only the most dedicated explorers who have conquered every world may enter.',
        stardustCost: 0, // FREE - but requires all games played
        difficulty: 'legendary',
        color: '#fbbf24',
        glowColor: '#fcd34d',
        educationalTopic: 'Nuclear fusion, solar flares, coronal mass ejections, the heliosphere',
        order: 100, // Ultimate - after everything
        isSpecial: true,
        isBossChallenge: true, // Unique flag - only after ALL games played
        gameMode: 'arcade', // Arcade shooter game!
        tagline: '☀️ FINAL BOSS - Defend our star from the alien invasion!',
    },
];

// Helper to get planets in journey order
export const getPlanetsInOrder = () => [...PLANETS].sort((a, b) => a.order - b.order);

// Get main journey planets (excludes bonus, master challenge, and boss challenge)
export const getMainJourneyPlanets = () => PLANETS.filter(p => !p.isBonus && !p.isMasterChallenge && !p.isBossChallenge).sort((a, b) => a.order - b.order);

// Get all playable games (excluding boss challenge)
export const getAllPlayableGames = () => PLANETS.filter(p => !p.isBossChallenge);

// Get games required for boss challenge unlock (all games except boss)
export const getGamesRequiredForBoss = () => PLANETS.filter(p => !p.isBossChallenge).map(p => p.id);

// Check if boss challenge is unlocked (all other games played at least once)
export const isBossChallengeUnlocked = (gamesPlayed: string[]): boolean => {
    const required = getGamesRequiredForBoss();
    return required.every(gameId => gamesPlayed.includes(gameId));
};

// Games required to unlock Master Challenge (first 3 games: Pluto, Neptune, Uranus)
export const getGamesRequiredForMasterChallenge = (): string[] => ['pluto', 'neptune', 'uranus'];

// Check if Master Challenge (Black Hole) is unlocked - requires 3 games played
export const isMasterChallengeUnlocked = (gamesPlayed: string[]): boolean => {
    const required = getGamesRequiredForMasterChallenge();
    return required.every(gameId => gamesPlayed.includes(gameId));
};

// Helper to check if planet is unlockable (previous planet beaten)
export const canUnlock = (planetId: string, unlockedPlanets: string[]): boolean => {
    const planet = PLANETS.find(p => p.id === planetId);
    if (!planet) return false;

    // Pluto (order 0) is always unlockable - it's FREE!
    if (planet.order === 0) return true;

    // Check if previous planet is unlocked
    const previousPlanet = PLANETS.find(p => p.order === planet.order - 1);
    return previousPlanet ? unlockedPlanets.includes(previousPlanet.id) : false;
};
