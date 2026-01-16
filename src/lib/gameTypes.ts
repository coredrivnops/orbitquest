// Game and planet type definitions

export interface Planet {
    id: string;
    name: string;
    gameName: string;
    description: string;
    stardustCost: number;
    difficulty: 'easy' | 'medium' | 'hard';
    color: string;
    glowColor: string;
    educationalTopic: string;
    order: number; // Journey order (0 = Pluto special, 1 = Neptune start)
    isBonus?: boolean; // Optional post-game content
    isSpecial?: boolean; // Special non-planet (Pluto, Moon)
    isHidden?: boolean; // Hidden until unlocked (surprise!)
    tagline?: string; // Fun tagline for special worlds
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
];

// Helper to get planets in journey order
export const getPlanetsInOrder = () => [...PLANETS].sort((a, b) => a.order - b.order);

// Get main journey planets (excludes bonus)
export const getMainJourneyPlanets = () => PLANETS.filter(p => !p.isBonus).sort((a, b) => a.order - b.order);

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
