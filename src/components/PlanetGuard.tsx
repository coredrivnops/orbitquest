'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress } from '@/lib/localStorage';
import { getPlanetsInOrder, Planet } from '@/lib/gameTypes';
import Link from 'next/link';

interface PlanetGuardProps {
    planetId: string;
    children: React.ReactNode;
}

/**
 * Guards a game page to ensure the planet is unlocked before allowing access.
 * Pluto is always accessible (starting planet).
 * Other planets require being in the unlockedPlanets array.
 */
export default function PlanetGuard({ planetId, children }: PlanetGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [requiredStardust, setRequiredStardust] = useState(0);
    const [currentStardust, setCurrentStardust] = useState(0);
    const [planetName, setPlanetName] = useState('');

    useEffect(() => {
        const checkAccess = () => {
            const progress = loadProgress();
            const planets = getPlanetsInOrder();
            const planet = planets.find(p => p.id === planetId);

            if (!planet) {
                // Planet doesn't exist, redirect to home
                router.push('/');
                return;
            }

            setPlanetName(planet.name);
            setCurrentStardust(progress.stardust);
            setRequiredStardust(planet.stardustCost);

            // Pluto is always unlocked (starting planet)
            if (planetId === 'pluto') {
                setIsUnlocked(true);
                setIsChecking(false);
                return;
            }

            // Check if planet is in the unlocked list
            if (progress.unlockedPlanets.includes(planetId)) {
                setIsUnlocked(true);
                setIsChecking(false);
                return;
            }

            // Planet is not unlocked
            setIsUnlocked(false);
            setIsChecking(false);
        };

        checkAccess();
    }, [planetId, router]);

    // Loading state
    if (isChecking) {
        return (
            <div className="min-h-screen bg-space-deep flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Checking mission clearance...</p>
                </div>
            </div>
        );
    }

    // Locked state - show a nice "locked" page
    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-space-deep flex items-center justify-center p-4">
                <div className="max-w-lg w-full text-center">
                    {/* Locked Icon */}
                    <div className="relative mb-8">
                        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-900/50 to-orange-900/50 border-4 border-red-500/50 flex items-center justify-center">
                            <span className="text-6xl">🔒</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-600 rounded-full text-white text-sm font-bold">
                            LOCKED
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="font-heading text-4xl text-white mb-4">
                        {planetName} is Locked
                    </h1>
                    <p className="text-text-secondary text-lg mb-8">
                        You need to unlock this planet at Mission Control before you can play!
                    </p>

                    {/* Requirements */}
                    <div className="bg-space-tertiary/50 border border-white/10 rounded-xl p-6 mb-8">
                        <p className="text-text-dim text-sm uppercase tracking-wider mb-4">Unlock Requirements</p>
                        <div className="flex items-center justify-center gap-6">
                            <div>
                                <p className="text-yellow-400 text-3xl font-bold">⭐ {requiredStardust}</p>
                                <p className="text-text-dim text-sm">Required</p>
                            </div>
                            <div className="text-text-dim text-2xl">→</div>
                            <div>
                                <p className={`text-3xl font-bold ${currentStardust >= requiredStardust ? 'text-green-400' : 'text-red-400'}`}>
                                    ⭐ {currentStardust}
                                </p>
                                <p className="text-text-dim text-sm">Your Stardust</p>
                            </div>
                        </div>
                        {currentStardust < requiredStardust && (
                            <p className="text-red-400 mt-4 text-sm">
                                You need {requiredStardust - currentStardust} more stardust!
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="px-8 py-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 border-2 border-neon-cyan rounded-xl text-neon-cyan font-heading text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2"
                        >
                            <span>🏠</span>
                            <span>Go to Mission Control</span>
                        </Link>
                        <Link
                            href="/games/pluto"
                            className="px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-500 rounded-xl text-purple-400 font-heading text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            <span>🎮</span>
                            <span>Earn Stardust on Pluto</span>
                        </Link>
                    </div>

                    {/* Hint */}
                    <p className="text-text-dim text-sm mt-8">
                        💡 Play games to earn stardust, then unlock new planets at Mission Control!
                    </p>
                </div>
            </div>
        );
    }

    // Planet is unlocked - render the game
    return <>{children}</>;
}
