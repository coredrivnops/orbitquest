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
}

export const PLANETS: Planet[] = [
    {
        id: 'earth',
        name: 'Earth',
        gameName: 'Orbital Defense',
        description: 'Defend Earth from space debris! A fast-paced shooter where you protect satellites from the Kessler Syndrome.',
        stardustCost: 0,
        difficulty: 'easy',
        color: '#3b82f6',
        glowColor: '#60a5fa',
        educationalTopic: 'Kessler Syndrome, orbital decay',
    },
    {
        id: 'mars',
        name: 'Mars',
        gameName: 'Rover Rally',
        description: 'Navigate the Martian terrain in a physics-based rover adventure. Master low-gravity jumps and wheel traction!',
        stardustCost: 0,
        difficulty: 'easy',
        color: '#dc2626',
        glowColor: '#f87171',
        educationalTopic: 'Low gravity, wheel traction',
    },
    {
        id: 'jupiter',
        name: 'Jupiter',
        gameName: 'Storm Fall',
        description: 'Descend through Jupiter\'s violent atmosphere, dodging lightning and turbulence in this vertical dodger.',
        stardustCost: 10000,
        difficulty: 'medium',
        color: '#f97316',
        glowColor: '#fb923c',
        educationalTopic: 'Gas giant atmospheres',
    },
    {
        id: 'saturn',
        name: 'Saturn',
        gameName: 'Ring Runner',
        description: 'Leap across Saturn\'s icy rings in this challenging platformer. Watch out for ice particles!',
        stardustCost: 25000,
        difficulty: 'medium',
        color: '#eab308',
        glowColor: '#facc15',
        educationalTopic: 'Ring composition, ice particles',
    },
    {
        id: 'venus',
        name: 'Venus',
        gameName: 'Acid Rain',
        description: 'Test your reflexes against Venus\'s deadly sulfuric acid clouds in this timing-based challenge.',
        stardustCost: 40000,
        difficulty: 'medium',
        color: '#f59e0b',
        glowColor: '#fbbf24',
        educationalTopic: 'Sulfuric acid clouds',
    },
    {
        id: 'uranus',
        name: 'Uranus',
        gameName: 'Ice Breaker',
        description: 'Solve puzzles in the frozen depths of Uranus. Navigate methane ice and extreme tilts.',
        stardustCost: 60000,
        difficulty: 'hard',
        color: '#06b6d4',
        glowColor: '#22d3ee',
        educationalTopic: 'Methane ice, extreme tilt',
    },
    {
        id: 'neptune',
        name: 'Neptune',
        gameName: 'Deep Dive',
        description: 'Fall endlessly through Neptune\'s supersonic winds in this endless faller challenge.',
        stardustCost: 80000,
        difficulty: 'hard',
        color: '#3b82f6',
        glowColor: '#60a5fa',
        educationalTopic: 'Supersonic winds',
    },
    {
        id: 'mercury',
        name: 'Mercury',
        gameName: 'Solar Flare',
        description: 'Survive waves of solar radiation on Mercury\'s scorched surface. No atmosphere to protect you!',
        stardustCost: 100000,
        difficulty: 'hard',
        color: '#9ca3af',
        glowColor: '#d1d5db',
        educationalTopic: 'Solar radiation, no atmosphere',
    },
];
