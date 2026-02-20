'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress } from '@/lib/localStorage';
import { getPlanetsInOrder } from '@/lib/gameTypes';
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

    // Locked state
    if (!isUnlocked) {
        // If mode is section, render a smaller card instead of full screen
        return (
            <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-900/50 rounded-2xl border border-white/10 p-8">
                <div className="max-w-lg w-full text-center">
                    {/* Locked Icon */}
                    <div className="relative mb-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-900/50 to-orange-900/50 border-4 border-red-500/50 flex items-center justify-center">
                            <span className="text-4xl">🔒</span>
                        </div>
                    </div>

                    {/* Message */}
                    <h2 className="font-heading text-3xl text-white mb-2">
                        {planetName} is Locked
                    </h2>
                    <p className="text-text-secondary mb-6">
                        Unlock this planet at Mission Control to play!
                    </p>

                    {/* Requirements */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-4">
                            <div>
                                <p className="text-yellow-400 text-2xl font-bold">⭐ {requiredStardust}</p>
                                <p className="text-text-dim text-xs uppercase">Required</p>
                            </div>
                            <div className="text-text-dim text-xl">→</div>
                            <div>
                                <p className={`text-2xl font-bold ${currentStardust >= requiredStardust ? 'text-green-400' : 'text-red-400'}`}>
                                    ⭐ {currentStardust}
                                </p>
                                <p className="text-text-dim text-xs uppercase">Your Stardust</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan rounded-xl text-neon-cyan font-bold transition-all hover:scale-105"
                    >
                        <span>🏠</span>
                        <span>Go to Mission Control</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Planet is unlocked - render the game
    return <>{children}</>;
}
