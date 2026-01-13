'use client';

import Link from 'next/link';
import { Planet } from '@/lib/gameTypes';
import { isPlanetUnlocked, loadProgress } from '@/lib/localStorage';
import { useEffect, useState } from 'react';

interface PlanetCardProps {
    planet: Planet;
    index: number;
}

export default function PlanetCard({ planet, index }: PlanetCardProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [highScore, setHighScore] = useState<number | null>(null);

    useEffect(() => {
        const progress = loadProgress();
        setIsUnlocked(progress.unlockedPlanets.includes(planet.id));
        setHighScore(progress.highScores[planet.id] || null);
    }, [planet.id]);

    const difficultyColors = {
        easy: 'text-green-400',
        medium: 'text-yellow-400',
        hard: 'text-red-400',
    };

    return (
        <div
            className={`planet-card group ${!isUnlocked ? 'locked' : ''}`}
            style={{
                animationDelay: `${index * 100}ms`,
                ['--planet-color' as string]: planet.color,
                ['--planet-glow' as string]: planet.glowColor,
            }}
        >
            {/* Planet Orb */}
            <div className="relative mb-4 flex justify-center">
                <div
                    className="w-20 h-20 rounded-full transition-all duration-500 group-hover:scale-110"
                    style={{
                        background: `radial-gradient(circle at 30% 30%, ${planet.glowColor}, ${planet.color})`,
                        boxShadow: isUnlocked
                            ? `0 0 30px ${planet.glowColor}, inset 0 0 20px rgba(255,255,255,0.2)`
                            : 'none',
                    }}
                />
                {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl">🔒</span>
                    </div>
                )}
            </div>

            {/* Planet Info */}
            <h3 className="font-heading text-xl text-center mb-1" style={{ color: planet.glowColor }}>
                {planet.name}
            </h3>
            <p className="font-ui text-sm text-text-secondary text-center mb-2">
                {planet.gameName}
            </p>

            {/* Difficulty Badge */}
            <div className="flex justify-center mb-3">
                <span className={`text-xs font-ui uppercase tracking-wider ${difficultyColors[planet.difficulty]}`}>
                    {planet.difficulty}
                </span>
            </div>

            {/* Description */}
            <p className="text-text-dim text-sm text-center mb-4 line-clamp-2">
                {planet.description}
            </p>

            {/* High Score or Cost */}
            <div className="text-center mb-4">
                {isUnlocked ? (
                    highScore !== null && (
                        <p className="text-text-secondary text-sm">
                            <span className="text-neon-purple">★</span> High Score: {highScore.toLocaleString()}
                        </p>
                    )
                ) : (
                    <p className="text-text-secondary text-sm">
                        <span className="text-yellow-400">✨</span> {planet.stardustCost.toLocaleString()} Stardust
                    </p>
                )}
            </div>

            {/* Action Button */}
            {isUnlocked ? (
                <Link
                    href={`/games/${planet.id}`}
                    className="btn-neon w-full text-center block"
                >
                    Play
                </Link>
            ) : (
                <button
                    className="btn-neon w-full opacity-50 cursor-not-allowed"
                    disabled
                >
                    Unlock
                </button>
            )}
        </div>
    );
}
