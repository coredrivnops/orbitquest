'use client';

import { useState, useEffect } from 'react';
import { loadProgress } from '@/lib/localStorage';
import { getPlanetsInOrder } from '@/lib/gameTypes';

// Achievement definitions
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    checkUnlocked: (progress: ReturnType<typeof loadProgress>) => boolean;
    secret?: boolean;
}

export const achievements: Achievement[] = [
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first game on Pluto',
        icon: '👣',
        color: 'bg-blue-500',
        checkUnlocked: (p) => p.hasPlayedFirstGame === true,
    },
    {
        id: 'stardust_collector',
        name: 'Stardust Collector',
        description: 'Earn 500 stardust',
        icon: '⭐',
        color: 'bg-yellow-500',
        checkUnlocked: (p) => p.stardust >= 500 || Object.values(p.highScores).reduce((a, b) => a + b, 0) >= 500,
    },
    {
        id: 'stardust_master',
        name: 'Stardust Master',
        description: 'Earn 5,000 stardust total',
        icon: '🌟',
        color: 'bg-yellow-400',
        checkUnlocked: (p) => p.stardust >= 5000 || Object.values(p.highScores).reduce((a, b) => a + b, 0) >= 5000,
    },
    {
        id: 'gas_giant_explorer',
        name: 'Gas Giant Explorer',
        description: 'Unlock Jupiter or Saturn',
        icon: '🪐',
        color: 'bg-orange-500',
        checkUnlocked: (p) => p.unlockedPlanets.includes('jupiter') || p.unlockedPlanets.includes('saturn'),
    },
    {
        id: 'inner_planets',
        name: 'Inner Planets',
        description: 'Reach Mars',
        icon: '🔴',
        color: 'bg-red-500',
        checkUnlocked: (p) => p.unlockedPlanets.includes('mars'),
    },
    {
        id: 'moon_discoverer',
        name: 'Moon Discoverer',
        description: 'Find and unlock the secret Moon',
        icon: '🌙',
        color: 'bg-gray-400',
        checkUnlocked: (p) => p.unlockedPlanets.includes('moon'),
        secret: true,
    },
    {
        id: 'homecoming',
        name: 'Homecoming',
        description: 'Reach Earth - complete the main journey',
        icon: '🏠',
        color: 'bg-green-500',
        checkUnlocked: (p) => p.unlockedPlanets.includes('earth'),
    },
    {
        id: 'bonus_hunter',
        name: 'Bonus Hunter',
        description: 'Unlock Venus or Mercury bonus planets',
        icon: '💎',
        color: 'bg-purple-500',
        checkUnlocked: (p) => p.unlockedPlanets.includes('venus') || p.unlockedPlanets.includes('mercury'),
    },
    {
        id: 'completionist',
        name: 'Completionist',
        description: 'Unlock all 10 planets',
        icon: '🏆',
        color: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
        checkUnlocked: (p) => getPlanetsInOrder().every(planet => p.unlockedPlanets.includes(planet.id)),
    },
    {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Score over 1,000 on any planet',
        icon: '🎯',
        color: 'bg-cyan-500',
        checkUnlocked: (p) => Object.values(p.highScores).some(score => score >= 1000),
    },
];

// Hook to get unlocked achievements
export function useAchievements() {
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [progress, setProgress] = useState<ReturnType<typeof loadProgress> | null>(null);

    useEffect(() => {
        const loadedProgress = loadProgress();
        setProgress(loadedProgress);

        const unlocked = achievements
            .filter(a => a.checkUnlocked(loadedProgress))
            .map(a => a.id);

        setUnlockedAchievements(unlocked);

        // Listen for updates
        const handleUpdate = () => {
            const newProgress = loadProgress();
            setProgress(newProgress);
            const newUnlocked = achievements
                .filter(a => a.checkUnlocked(newProgress))
                .map(a => a.id);
            setUnlockedAchievements(newUnlocked);
        };

        window.addEventListener('stardust-earned', handleUpdate);
        window.addEventListener('planet-unlocked', handleUpdate);
        window.addEventListener('storage', handleUpdate);
        window.addEventListener('focus', handleUpdate);

        return () => {
            window.removeEventListener('stardust-earned', handleUpdate);
            window.removeEventListener('planet-unlocked', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
            window.removeEventListener('focus', handleUpdate);
        };
    }, []);

    return { unlockedAchievements, progress, achievements };
}

// Achievement badge component
interface AchievementBadgeProps {
    achievement: Achievement;
    unlocked: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, unlocked, size = 'md' }: AchievementBadgeProps) {
    const sizeClasses = {
        sm: 'w-10 h-10 text-lg',
        md: 'w-14 h-14 text-2xl',
        lg: 'w-20 h-20 text-4xl',
    };

    const isSecret = achievement.secret && !unlocked;

    return (
        <div className="group relative">
            <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 ${unlocked
                    ? `${achievement.color} shadow-lg hover:scale-110`
                    : 'bg-gray-800/50 grayscale opacity-50'
                    }`}
            >
                <span className={unlocked ? '' : 'opacity-30'}>
                    {isSecret ? '❓' : achievement.icon}
                </span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-space-tertiary/95 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className={`font-heading text-sm ${unlocked ? 'text-neon-cyan' : 'text-gray-400'}`}>
                        {isSecret ? '???' : achievement.name}
                    </p>
                    <p className="text-text-dim text-xs mt-1">
                        {isSecret ? 'Secret achievement - keep exploring!' : achievement.description}
                    </p>
                    {unlocked && (
                        <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                            <span>✓</span> Unlocked
                        </p>
                    )}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-space-tertiary/95 border-r border-b border-white/10 rotate-45" />
            </div>
        </div>
    );
}

// Achievement display grid
export function AchievementsDisplay() {
    const { unlockedAchievements } = useAchievements();

    const unlockedCount = unlockedAchievements.length;
    const totalCount = achievements.length;

    return (
        <div className="bg-space-tertiary/30 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-xl text-white">Achievements</h3>
                <span className="text-neon-cyan text-sm font-heading">
                    {unlockedCount}/{totalCount}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500"
                    style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                />
            </div>

            {/* Achievement grid */}
            <div className="flex flex-wrap gap-3 justify-center">
                {achievements.map(achievement => (
                    <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={unlockedAchievements.includes(achievement.id)}
                        size="md"
                    />
                ))}
            </div>
        </div>
    );
}
