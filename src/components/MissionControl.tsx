'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPlanetsInOrder, canUnlock, Planet, getMainJourneyPlanets } from '@/lib/gameTypes';
import { loadProgress, unlockPlanet } from '@/lib/localStorage';
import { PlanetOrb } from './PlanetOrb';

// Shooting star component
function ShootingStar({ delay }: { delay: number }) {
    return (
        <div
            className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
            style={{
                top: `${Math.random() * 50}%`,
                left: '-10%',
                animationDelay: `${delay}s`,
                boxShadow: '0 0 6px 2px rgba(255,255,255,0.5)'
            }}
        />
    );
}

// Floating planet orb
function FloatingPlanet({ color, size, x, y, duration }: {
    color: string; size: number; x: number; y: number; duration: number
}) {
    return (
        <div
            className="absolute rounded-full opacity-20 animate-float"
            style={{
                background: `radial-gradient(circle at 30% 30%, ${color}88, ${color}44)`,
                width: size,
                height: size,
                left: `${x}%`,
                top: `${y}%`,
                animationDuration: `${duration}s`,
                filter: 'blur(1px)'
            }}
        />
    );
}

export default function MissionControl() {
    const router = useRouter();
    const [progress, setProgress] = useState({
        stardust: 0,
        unlockedPlanets: ['pluto'], // Pluto is FREE!
        highScores: {} as Record<string, number>,
        hasPlayedFirstGame: false,
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [unlockingPlanet, setUnlockingPlanet] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load progress and set up listeners
    const refreshProgress = useCallback(() => {
        const loaded = loadProgress();
        setProgress({
            ...loaded,
            hasPlayedFirstGame: loaded.hasPlayedFirstGame || false,
        });
    }, []);

    useEffect(() => {
        refreshProgress();
        setIsLoaded(true);

        // Listen for custom events
        const handleStardustEarned = () => refreshProgress();
        const handlePlanetUnlocked = () => refreshProgress();
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'orbitquest_progress') {
                refreshProgress();
            }
        };

        window.addEventListener('stardust-earned', handleStardustEarned);
        window.addEventListener('planet-unlocked', handlePlanetUnlocked);
        window.addEventListener('storage', handleStorageChange);

        // Also refresh on focus (when returning from a game)
        const handleFocus = () => refreshProgress();
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('stardust-earned', handleStardustEarned);
            window.removeEventListener('planet-unlocked', handlePlanetUnlocked);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [refreshProgress]);

    // Handle unlock button click
    const handleUnlock = useCallback((planet: Planet) => {
        if (unlockingPlanet) return; // Prevent double-click

        setUnlockingPlanet(planet.id);

        const result = unlockPlanet(planet.id, planet.stardustCost);

        if (result.success) {
            // Update local state immediately
            setProgress({
                ...result.progress,
                hasPlayedFirstGame: result.progress.hasPlayedFirstGame || false,
            });

            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('planet-unlocked', {
                detail: { planetId: planet.id }
            }));

            // Navigate to the game after a brief animation
            setTimeout(() => {
                setUnlockingPlanet(null);
                router.push(`/games/${planet.id}`);
            }, 500);
        } else {
            setUnlockingPlanet(null);
        }
    }, [unlockingPlanet, router]);

    // Animated starfield canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = 600;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create stars
        const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }

        // Create nebula particles
        const nebulas: { x: number; y: number; radius: number; color: string }[] = [
            { x: canvas.width * 0.2, y: canvas.height * 0.3, radius: 200, color: '100, 100, 255' },
            { x: canvas.width * 0.8, y: canvas.height * 0.6, radius: 150, color: '255, 100, 150' },
            { x: canvas.width * 0.5, y: canvas.height * 0.8, radius: 180, color: '100, 255, 200' },
        ];

        let animationId: number;
        let frame = 0;

        const animate = () => {
            frame++;
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw nebulas
            for (const nebula of nebulas) {
                const gradient = ctx.createRadialGradient(
                    nebula.x, nebula.y, 0,
                    nebula.x, nebula.y, nebula.radius
                );
                gradient.addColorStop(0, `rgba(${nebula.color}, 0.1)`);
                gradient.addColorStop(0.5, `rgba(${nebula.color}, 0.03)`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw and update stars
            for (const star of stars) {
                // Twinkle effect
                const twinkle = Math.sin(frame * 0.05 + star.x) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Slow drift
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const planets = getPlanetsInOrder();
    const isUnlocked = (planetId: string) => progress.unlockedPlanets.includes(planetId);

    const nextPlanet = planets.find(p =>
        !isUnlocked(p.id) && canUnlock(p.id, progress.unlockedPlanets)
    );

    const currentPlanet = [...planets].reverse().find(p => isUnlocked(p.id));

    // Count only main journey planets (excludes bonus AND special like Pluto/Moon)
    // Progress only shows after first game played
    const mainPlanets = getMainJourneyPlanets().filter(p => !p.isSpecial);
    const unlockedMainPlanets = mainPlanets.filter(p => isUnlocked(p.id));
    const journeyProgress = progress.hasPlayedFirstGame
        ? Math.round((unlockedMainPlanets.length / mainPlanets.length) * 100)
        : 0; // Start at 0% until first game played

    return (
        <div className="min-h-screen bg-space-deep overflow-hidden">

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes shooting-star {
                    0% { transform: translateX(0) translateY(0); opacity: 1; }
                    70% { opacity: 1; }
                    100% { transform: translateX(calc(100vw + 200px)) translateY(200px); opacity: 0; }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes orbit {
                    0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
                    50% { box-shadow: 0 0 40px currentColor, 0 0 80px currentColor; }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-in-left {
                    0% { opacity: 0; transform: translateX(-50px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes unlock-spin {
                    0% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.2); }
                    100% { transform: rotate(360deg) scale(1); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-shooting-star { animation: shooting-star 3s linear infinite; }
                .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
                .animate-orbit { animation: orbit 20s linear infinite; }
                .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .animate-slide-in-left { animation: slide-in-left 0.6s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
                .animate-unlock-spin { animation: unlock-spin 0.5s ease-out; }
                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-400 { animation-delay: 0.4s; }
            `}</style>

            {/* Hero Section with Animated Starfield */}
            <section className="relative h-[600px] overflow-hidden border-b border-neon-cyan/20">
                {/* Canvas starfield */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                />

                {/* Floating decorative planets */}
                <FloatingPlanet color="#3b82f6" size={80} x={10} y={20} duration={8} />
                <FloatingPlanet color="#f97316" size={60} x={85} y={60} duration={10} />
                <FloatingPlanet color="#06b6d4" size={40} x={70} y={15} duration={7} />
                <FloatingPlanet color="#dc2626" size={50} x={20} y={70} duration={9} />

                {/* Shooting stars */}
                {[...Array(3)].map((_, i) => (
                    <ShootingStar key={i} delay={i * 4 + 2} />
                ))}

                {/* Content */}
                <div className={`relative z-10 h-full flex flex-col items-center justify-center px-4 text-center ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    {/* Logo with glow effect */}
                    <div className="relative mb-6">
                        <h1 className="font-heading text-5xl md:text-7xl text-white">
                            <span className="text-neon-cyan drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]">Orbit</span>
                            <span className="text-white">Quest</span>
                        </h1>
                        {/* Orbiting dot */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="animate-orbit">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_#fbbf24]" />
                            </div>
                        </div>
                    </div>

                    <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
                        Your probe is stranded at the edge of the solar system.
                        Navigate through <span className="text-neon-cyan font-bold">8 planets</span> to find your way{' '}
                        <span className="text-green-400 font-bold">home to Earth</span>.
                    </p>

                    {/* Stardust Balance with pulse effect */}
                    <div className="relative inline-flex items-center gap-3 bg-space-tertiary/70 backdrop-blur-sm px-8 py-4 rounded-full border border-neon-cyan/40">
                        <div className="absolute inset-0 rounded-full border border-neon-cyan/30 animate-pulse-ring" />
                        <span className="text-yellow-400 text-3xl animate-bounce">⭐</span>
                        <span className="text-3xl font-heading text-white">{progress.stardust.toLocaleString()}</span>
                        <span className="text-text-dim text-sm uppercase tracking-wider">Stardust</span>
                    </div>

                    {/* CTA Button */}
                    <Link
                        href={currentPlanet ? `/games/${currentPlanet.id}` : '/games/neptune'}
                        className="mt-8 group relative inline-flex items-center gap-2 px-10 py-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 border-2 border-neon-cyan rounded-lg text-neon-cyan font-heading text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
                    >
                        <span>🚀</span>
                        <span>Start Your Journey</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>

                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-space-deep to-transparent" />
            </section>

            {/* Journey Progress Bar */}
            <section className="bg-space-secondary/30 border-b border-white/5 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-text-dim text-sm uppercase tracking-wider whitespace-nowrap">Journey Progress</span>
                        <div className="flex-1 h-4 bg-space-tertiary rounded-full overflow-hidden relative">
                            {/* Animated gradient fill */}
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 transition-all duration-1000 relative overflow-hidden"
                                style={{ width: `${journeyProgress}%` }}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"
                                    style={{ transform: 'skewX(-20deg)', animation: 'shimmer 2s infinite' }}
                                />
                            </div>
                            {/* Planet markers */}
                            {[0, 17, 33, 50, 67, 83, 100].map((pos, i) => (
                                <div
                                    key={i}
                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30"
                                    style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }}
                                />
                            ))}
                        </div>
                        <span className="text-neon-cyan font-bold text-lg">{journeyProgress}%</span>
                    </div>
                    <p className="text-center text-text-dim text-sm mt-3">
                        <span className="text-green-400">{unlockedMainPlanets.length}</span> of {mainPlanets.length} planets conquered •
                        <span className="text-yellow-400"> {mainPlanets.length - unlockedMainPlanets.length}</span> remaining to reach Earth
                    </p>
                </div>
            </section>

            {/* Continue Playing - MOVED ABOVE NEXT DESTINATION */}
            {currentPlanet && (
                <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 ${isLoaded ? 'animate-scale-in animation-delay-100' : 'opacity-0'}`}>
                    <div className="rounded-xl border-2 border-neon-cyan/40 bg-gradient-to-br from-space-tertiary to-cyan-900/20 backdrop-blur-sm p-6 hover:border-neon-cyan/60 transition-colors duration-300">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="flex-shrink-0">
                                    <PlanetOrb planetId={currentPlanet.id} size={80} />
                                </div>
                                <div>
                                    <p className="text-neon-cyan text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        Continue Playing
                                    </p>
                                    <p className="font-heading text-2xl md:text-3xl text-white">{currentPlanet.name}: {currentPlanet.gameName}</p>
                                    {progress.highScores[currentPlanet.id] && (
                                        <p className="text-green-400 text-sm mt-1">
                                            🏆 High Score: {progress.highScores[currentPlanet.id].toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`/games/${currentPlanet.id}`}
                                className="px-10 py-4 bg-neon-cyan/20 hover:bg-neon-cyan/40 border-2 border-neon-cyan rounded-lg text-neon-cyan font-heading text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                            >
                                🚀 PLAY NOW →
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Next Destination - Animated Card */}
            {nextPlanet && (
                <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isLoaded ? 'animate-slide-in-left animation-delay-200' : 'opacity-0'}`}>
                    <div className={`relative overflow-hidden rounded-2xl border-2 p-8 group transition-colors duration-300 ${nextPlanet.isHidden
                            ? 'border-pink-500/60 bg-gradient-to-br from-purple-900/50 to-pink-900/30 hover:border-pink-400'
                            : 'border-neon-purple/50 bg-gradient-to-br from-space-tertiary to-purple-900/30 hover:border-neon-purple'
                        }`}>
                        {/* Animated background glow */}
                        <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl transition-all duration-500 ${nextPlanet.isHidden ? 'bg-pink-500/20 group-hover:bg-pink-500/30' : 'bg-purple-500/10 group-hover:bg-purple-500/20'
                            }`} />

                        {/* Badge - different for hidden reveals */}
                        <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-ui animate-pulse ${nextPlanet.isHidden
                                ? 'bg-pink-500/40 text-pink-200'
                                : 'bg-neon-purple/30 text-neon-purple'
                            }`}>
                            {nextPlanet.isHidden ? '✨ SURPRISE REVEAL!' : '🔒 NEXT DESTINATION'}
                        </div>

                        <div className="relative grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <p className="text-text-dim uppercase tracking-widest mb-2 text-sm">
                                    {nextPlanet.isHidden ? '🌙 Hidden Challenge' : `Stage ${nextPlanet.order}`}
                                </p>
                                <h2 className="font-heading text-5xl text-white mb-3">{nextPlanet.name}</h2>
                                <p className={`text-2xl mb-4 font-ui ${nextPlanet.isHidden ? 'text-pink-400' : 'text-neon-purple'}`}>{nextPlanet.gameName}</p>
                                <p className="text-text-secondary text-lg mb-6 leading-relaxed">{nextPlanet.description}</p>

                                <div className="flex flex-wrap items-center gap-4">
                                    {progress.stardust >= nextPlanet.stardustCost ? (
                                        <button
                                            onClick={() => handleUnlock(nextPlanet)}
                                            disabled={unlockingPlanet === nextPlanet.id}
                                            className={`px-8 py-3 text-lg font-bold rounded border-2 transition-all ${unlockingPlanet === nextPlanet.id
                                                ? 'bg-purple-500/50 border-purple-400 text-white animate-unlock-spin'
                                                : 'bg-neon-purple/20 hover:bg-neon-purple/40 border-neon-purple text-neon-purple hover:scale-105'
                                                }`}
                                        >
                                            {unlockingPlanet === nextPlanet.id ? '🔓 Unlocking...' : '🔓 Unlock & Play'}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <button className="px-8 py-3 bg-white/10 text-white/50 rounded cursor-not-allowed border border-white/20">
                                                🔒 Locked
                                            </button>
                                            <div className="text-yellow-400">
                                                <span className="text-lg font-bold">{(nextPlanet.stardustCost - progress.stardust).toLocaleString()}</span>
                                                <span className="text-sm"> more ⭐ needed</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-text-dim text-sm mt-4">
                                    Unlock Cost: <span className="text-yellow-400 font-bold">{nextPlanet.stardustCost.toLocaleString()} ⭐</span>
                                </p>
                            </div>

                            {/* Realistic Planet Visual */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    {/* Outer glow ring */}
                                    <div
                                        className="absolute inset-0 rounded-full animate-pulse-ring"
                                        style={{
                                            background: `radial-gradient(circle, ${nextPlanet.glowColor}40, transparent 70%)`,
                                            width: 220,
                                            height: 220,
                                            left: -15,
                                            top: -15,
                                        }}
                                    />
                                    <PlanetOrb
                                        planetId={nextPlanet.id}
                                        size={190}
                                        className={unlockingPlanet === nextPlanet.id ? 'animate-unlock-spin' : ''}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Ad Slot */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="h-[90px] bg-space-tertiary/30 rounded-lg border border-white/5 flex items-center justify-center">
                    <span className="text-text-dim text-sm opacity-50">Advertisement</span>
                </div>
            </div>

            {/* Journey Map */}
            <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isLoaded ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
                <div className="text-center mb-10">
                    <h2 className="font-heading text-4xl text-white mb-3">Your Journey Home</h2>
                    <p className="text-text-secondary text-lg">10 worlds. Unique challenges. <span className="text-purple-400">Some surprises along the way...</span></p>
                </div>

                {/* Planet Path */}
                <div className="relative">
                    {/* Connection line with gradient */}
                    <div className="absolute hidden md:block top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 via-orange-500 to-green-500 opacity-40 -translate-y-1/2 rounded-full" />

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
                        {planets.map((planet, index) => {
                            const unlocked = isUnlocked(planet.id);
                            const highScore = progress.highScores[planet.id] || 0;
                            const isNext = nextPlanet?.id === planet.id;
                            const isHome = planet.id === 'earth';
                            const canUnlockNow = isNext && progress.stardust >= planet.stardustCost;

                            // SURPRISE! Hidden planets show as mystery until unlocked
                            const showAsMystery = planet.isHidden && !unlocked;

                            return (
                                <div
                                    key={planet.id}
                                    className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${showAsMystery
                                        ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/20 border-2 border-dashed border-purple-500/40'
                                        : unlocked
                                            ? 'bg-space-tertiary/60 hover:bg-space-tertiary border border-green-500/30'
                                            : isNext
                                                ? 'bg-purple-900/40 border-2 border-neon-purple/60'
                                                : 'bg-space-dark/50 opacity-60 hover:opacity-80'
                                        }`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Status badge */}
                                    <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${showAsMystery
                                        ? 'bg-purple-600 text-white shadow-purple-500/50 animate-pulse'
                                        : unlocked
                                            ? 'bg-green-500 text-white shadow-green-500/50'
                                            : isNext
                                                ? 'bg-purple-500 text-white shadow-purple-500/50 animate-bounce'
                                                : 'bg-gray-700 text-gray-400'
                                        }`}>
                                        {showAsMystery ? '?' : unlocked ? '✓' : index + 1}
                                    </div>

                                    {/* Special badges */}
                                    {showAsMystery && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-500/30 text-purple-300 text-[10px] rounded-full font-bold animate-pulse">
                                            ???
                                        </div>
                                    )}
                                    {!showAsMystery && planet.isBonus && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-500/30 text-yellow-400 text-[10px] rounded-full font-bold">
                                            BONUS
                                        </div>
                                    )}
                                    {!showAsMystery && isHome && !planet.isBonus && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500/30 text-green-400 text-[10px] rounded-full font-bold">
                                            🏠 HOME
                                        </div>
                                    )}

                                    {/* Planet orb - Mystery or Real */}
                                    {showAsMystery ? (
                                        <div className="mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center border-2 border-dashed border-purple-400/50">
                                            <span className="text-2xl animate-pulse">?</span>
                                        </div>
                                    ) : (
                                        <div className={`mb-3 transition-all duration-300 ${!unlocked ? 'grayscale opacity-60' : ''}`}>
                                            <PlanetOrb
                                                planetId={planet.id}
                                                size={56}
                                                animated={unlocked}
                                            />
                                        </div>
                                    )}

                                    <p className={`font-heading text-sm ${showAsMystery ? 'text-purple-300' : unlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {showAsMystery ? '???' : planet.name}
                                    </p>

                                    <p className="text-text-dim text-xs truncate w-full text-center mt-1">
                                        {showAsMystery ? 'Surprise!' : planet.gameName}
                                    </p>

                                    {unlocked ? (
                                        <Link
                                            href={`/games/${planet.id}`}
                                            className="mt-3 px-4 py-1.5 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan text-xs rounded-full transition-all duration-300 hover:scale-110"
                                        >
                                            PLAY
                                        </Link>
                                    ) : canUnlockNow ? (
                                        <button
                                            onClick={() => handleUnlock(planet)}
                                            className="mt-3 px-3 py-1.5 bg-neon-purple/30 hover:bg-neon-purple/50 text-neon-purple text-xs rounded-full transition-all duration-300 hover:scale-110"
                                        >
                                            🔓 UNLOCK
                                        </button>
                                    ) : (
                                        <p className="mt-3 text-yellow-400/70 text-xs font-bold">
                                            {planet.stardustCost}⭐
                                        </p>
                                    )}

                                    {highScore > 0 && (
                                        <p className="text-green-400/80 text-[10px] mt-1">
                                            🏆 {highScore.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gradient-to-b from-space-secondary/30 to-space-deep border-y border-white/5 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-heading text-4xl text-white text-center mb-16">How It Works</h2>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: '🎮', title: 'Play Games', color: 'text-blue-400', desc: 'Each planet has a unique arcade game inspired by real science.' },
                            { icon: '⭐', title: 'Earn Stardust', color: 'text-yellow-400', desc: 'Collect stardust by scoring high and building combos!' },
                            { icon: '🔓', title: 'Unlock Planets', color: 'text-purple-400', desc: 'Use stardust to unlock new worlds on your journey.' },
                            { icon: '🏠', title: 'Reach Home', color: 'text-green-400', desc: 'Complete all planets to reach Earth and become a champion!' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="text-center group"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-space-tertiary/50 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-space-tertiary transition-all duration-300 border border-white/10">
                                    {item.icon}
                                </div>
                                <h3 className={`font-heading text-xl ${item.color} mb-3`}>{item.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Educational Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="planet-card hover:border-neon-cyan/50 transition-colors duration-300">
                        <h3 className="font-heading text-2xl text-neon-cyan mb-4">🧠 Learn While You Play</h3>
                        <p className="text-text-secondary mb-4 leading-relaxed">
                            Every game in OrbitQuest is designed around real science. Neptune&apos;s game features
                            its supersonic winds. Uranus&apos;s game is based on its 98° axial tilt. Earth&apos;s game
                            teaches orbital mechanics.
                        </p>
                        <p className="text-text-secondary mb-4 leading-relaxed">
                            Answer trivia questions between levels to test your space knowledge and earn
                            bonus stardust. Who said learning can&apos;t be fun?
                        </p>
                        <ul className="space-y-2 text-sm text-text-dim">
                            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Real planetary facts in gameplay</li>
                            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Trivia with educational explanations</li>
                            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Detailed planet info pages</li>
                        </ul>
                    </div>

                    <div className="planet-card bg-gradient-to-br from-space-tertiary to-blue-900/20 hover:border-neon-purple/50 transition-colors duration-300">
                        <h3 className="font-heading text-2xl text-neon-purple mb-4">🌌 Our Solar System</h3>
                        <p className="text-text-secondary mb-4 leading-relaxed">
                            Our solar system spans billions of kilometers, from the icy winds of Neptune
                            to the scorching surface of Mercury. Each world presents unique challenges
                            and fascinating science.
                        </p>
                        <p className="text-text-secondary mb-4 leading-relaxed">
                            In OrbitQuest, experience these worlds through engaging arcade games while
                            learning about atmospheres, moons, and our place in the cosmos.
                        </p>
                        <Link
                            href="/games/neptune"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-purple/20 hover:bg-neon-purple/40 border border-neon-purple/50 rounded-lg text-neon-purple transition-all duration-300 hover:scale-105"
                        >
                            <span>🚀</span>
                            <span>Start Your Journey</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Ad Slot */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                <div className="h-[250px] bg-space-tertiary/30 rounded-lg border border-white/5 flex items-center justify-center">
                    <span className="text-text-dim text-sm opacity-50">Advertisement</span>
                </div>
            </div>

            {/* Fun Facts */}
            <section className="bg-space-dark border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-neon-cyan uppercase tracking-widest text-sm mb-4">✨ Did You Know?</p>
                    <p className="text-text-secondary text-xl italic max-w-3xl mx-auto leading-relaxed">
                        &quot;If you could stand on Neptune, the winds would blow you away at 2,000 km/h —
                        faster than the speed of sound on Earth. That&apos;s why we&apos;re playing the game from
                        the safety of our probe!&quot;
                    </p>
                </div>
            </section>

        </div>
    );
}
