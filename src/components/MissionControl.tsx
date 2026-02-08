'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPlanetsInOrder, canUnlock, Planet, getMainJourneyPlanets, isBossChallengeUnlocked, getGamesRequiredForBoss, PLANETS } from '@/lib/gameTypes';
import { loadProgress, unlockPlanet } from '@/lib/localStorage';
import { PlanetOrb } from './PlanetOrb';
import Confetti from './Confetti';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { RotatingFunFacts } from './PlanetTooltip';
import { AchievementsDisplay } from './Achievements';

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

// Sun Boss Challenge Section Component
function SunBossChallengeSection() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [progress, setProgress] = useState({ played: 0, required: 0 });

    useEffect(() => {
        const playerProgress = loadProgress();
        const gamesPlayed = playerProgress.gamesPlayedAtLeastOnce || [];
        const unlock = isBossChallengeUnlocked(gamesPlayed);
        setIsUnlocked(unlock);

        const required = getGamesRequiredForBoss();
        setProgress({
            played: gamesPlayed.length,
            required: required.length
        });
    }, []);

    const progressPercent = progress.required > 0 ? (progress.played / progress.required) * 100 : 0;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                href="/games/sun"
                className="group relative block rounded-2xl overflow-hidden border-2 border-amber-500/40 hover:border-amber-400/80 transition-all duration-500 hover:shadow-[0_0_60px_rgba(251,191,36,0.3)]"
            >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-orange-900 to-red-950 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-red-600/10 animate-aurora" />

                {/* Animated stars and solar particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-amber-300 rounded-full animate-pulse"
                            style={{
                                left: `${5 + Math.random() * 90}%`,
                                top: `${10 + Math.random() * 80}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: 0.4 + Math.random() * 0.4
                            }}
                        />
                    ))}
                </div>

                {/* Sun visual - left side */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 w-40 h-40 md:w-56 md:h-56">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_80px_30px_rgba(251,191,36,0.5)] animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-300 to-orange-500" />
                    {/* Solar flares */}
                    <div className="absolute -top-4 left-1/2 w-4 h-12 bg-gradient-to-t from-amber-500 to-transparent rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute top-1/2 -right-4 w-12 h-4 bg-gradient-to-r from-amber-500 to-transparent rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                {/* Lock overlay if not unlocked */}
                {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="absolute top-4 right-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-full text-sm font-bold border border-red-500/30">
                            🔒 LOCKED
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="relative py-8 px-8 pl-24 md:pl-40 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-500/30 to-red-500/30 text-amber-400 text-sm rounded-full font-bold border border-amber-500/30 animate-pulse">
                                ☀️ FINAL BOSS
                            </span>
                            {isUnlocked && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold border border-green-500/30">
                                    ✓ UNLOCKED
                                </span>
                            )}
                        </div>
                        <h3 className="font-heading text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 mb-1">
                            Solar Showdown: Defend the Sun!
                        </h3>
                        <p className="text-amber-300 text-sm md:text-base mb-2">
                            {isUnlocked ? (
                                <>The alien armada approaches! <span className="text-amber-400 font-bold">Command your squadron!</span></>
                            ) : (
                                <>Play <span className="text-amber-400 font-bold">ALL games at least once</span> to unlock this epic arcade battle!</>
                            )}
                        </p>

                        {/* Progress bar - only show if not unlocked */}
                        {!isUnlocked && (
                            <div className="mt-3 max-w-xs mx-auto md:mx-0">
                                <div className="flex justify-between text-xs text-amber-300/70 mb-1">
                                    <span>Games Played</span>
                                    <span>{progress.played}/{progress.required}</span>
                                </div>
                                <div className="w-full h-2 bg-amber-900/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-center text-center px-4 border-l border-amber-500/30">
                            <span className="text-2xl mb-1">🎮</span>
                            <span className="text-amber-300 text-xs">Arcade Mode</span>
                        </div>
                        <div className="hidden sm:flex flex-col items-center text-center px-4 border-l border-amber-500/30">
                            <span className="text-2xl mb-1">👽</span>
                            <span className="text-orange-300 text-xs">10 Waves</span>
                        </div>
                        <button className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${isUnlocked
                            ? 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                            : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                            }`}>
                            <span>☀️</span>
                            <span>{isUnlocked ? 'Enter Battle' : 'Locked'}</span>
                            {isUnlocked && <span className="group-hover:translate-x-1 transition-transform">→</span>}
                        </button>
                    </div>
                </div>

                {/* Glowing edge */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-60" />
            </Link>
        </section>
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
    const [showConfetti, setShowConfetti] = useState(false);
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
            // 🎉 Trigger confetti celebration!
            setShowConfetti(true);

            // Update local state immediately
            setProgress({
                ...result.progress,
                hasPlayedFirstGame: result.progress.hasPlayedFirstGame || false,
            });

            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('planet-unlocked', {
                detail: { planetId: planet.id }
            }));

            // Navigate to the game after confetti animation
            setTimeout(() => {
                setUnlockingPlanet(null);
                router.push(`/games/${planet.id}`);
            }, 1200); // Slightly longer to enjoy confetti
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

    // Scroll reveal for sections
    const [howItWorksRef, howItWorksVisible] = useScrollReveal<HTMLElement>();
    const [educationRef, educationVisible] = useScrollReveal<HTMLElement>();
    const [blogRef, blogVisible] = useScrollReveal<HTMLElement>();

    return (
        <div className="min-h-screen bg-space-deep overflow-hidden">

            {/* 🎉 Confetti celebration on planet unlock */}
            <Confetti
                active={showConfetti}
                onComplete={() => setShowConfetti(false)}
                particleCount={100}
                duration={2500}
            />

            {/* CSS Animations - Premium Cosmic Effects */}
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
                @keyframes orbit-small {
                    0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
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
                @keyframes nebula-drift {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                    50% { transform: translate(30px, -20px) scale(1.1); opacity: 0.5; }
                }
                @keyframes cosmic-pulse {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.05); filter: brightness(1.2); }
                }
                @keyframes typewriter {
                    from { width: 0; }
                    to { width: 100%; }
                }
                @keyframes blink-caret {
                    from, to { border-color: transparent; }
                    50% { border-color: #00f0ff; }
                }
                @keyframes aurora {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes card-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.2), inset 0 0 30px rgba(0, 240, 255, 0.05); }
                    50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.4), inset 0 0 50px rgba(0, 240, 255, 0.1); }
                }
                @keyframes planet-hover {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-10px) scale(1.02); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-shooting-star { animation: shooting-star 3s linear infinite; }
                .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
                .animate-orbit { animation: orbit 20s linear infinite; }
                .animate-orbit-small { animation: orbit-small 15s linear infinite; }
                .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .animate-slide-in-left { animation: slide-in-left 0.6s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
                .animate-unlock-spin { animation: unlock-spin 0.5s ease-out; }
                .animate-nebula { animation: nebula-drift 15s ease-in-out infinite; }
                .animate-cosmic-pulse { animation: cosmic-pulse 3s ease-in-out infinite; }
                .animate-aurora { animation: aurora 10s ease infinite; background-size: 200% 200%; }
                .animate-card-glow { animation: card-glow 3s ease-in-out infinite; }
                .animate-planet-hover { animation: planet-hover 4s ease-in-out infinite; }
                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-1000 { animation-delay: 1s; }
                .text-gradient-cosmic {
                    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 50%, #ec4899 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>

            {/* Hero Section with Animated Starfield */}
            <section className="relative h-[700px] overflow-hidden border-b border-neon-cyan/20">
                {/* Canvas starfield */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                />

                {/* Nebula background effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-nebula" />
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-nebula animation-delay-500" />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-nebula animation-delay-1000" />
                </div>

                {/* Floating decorative planets with enhanced animation */}
                <FloatingPlanet color="#3b82f6" size={100} x={8} y={15} duration={12} />
                <FloatingPlanet color="#f97316" size={70} x={88} y={55} duration={14} />
                <FloatingPlanet color="#06b6d4" size={50} x={75} y={10} duration={10} />
                <FloatingPlanet color="#dc2626" size={60} x={15} y={65} duration={11} />
                <FloatingPlanet color="#a855f7" size={40} x={80} y={80} duration={9} />

                {/* More shooting stars */}
                {[...Array(5)].map((_, i) => (
                    <ShootingStar key={i} delay={i * 3 + 1} />
                ))}

                {/* Content */}
                <div className={`relative z-10 h-full flex flex-col items-center justify-center px-4 text-center ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>

                    {/* Status Badge */}
                    <div className="mb-6 px-5 py-2 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-purple-600/30 rounded-full border border-purple-400/40 animate-aurora">
                        <span className="text-sm font-ui text-purple-200 tracking-widest uppercase">🚀 Free Space Arcade Adventure</span>
                    </div>

                    {/* Logo with enhanced glow effect */}
                    <div className="relative mb-8">
                        <h1 className="font-heading text-6xl md:text-8xl text-white animate-cosmic-pulse">
                            <span className="text-gradient-cosmic drop-shadow-[0_0_40px_rgba(0,240,255,0.6)]">Orbit</span>
                            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Quest</span>
                        </h1>
                        {/* Multiple orbiting particles */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="animate-orbit">
                                <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_#fbbf24,0_0_30px_#fbbf24]" />
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="animate-orbit-small" style={{ animationDelay: '-5s' }}>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                            </div>
                        </div>
                    </div>

                    {/* Dramatic storytelling text */}
                    <div className="max-w-3xl mx-auto mb-10">
                        <p className="text-2xl md:text-3xl text-white font-ui mb-4 leading-relaxed">
                            Your probe is <span className="text-red-400 font-bold">stranded</span> at the edge of the solar system.
                        </p>
                        <p className="text-xl md:text-2xl text-text-secondary leading-relaxed">
                            Navigate through <span className="text-neon-cyan font-bold text-2xl">10 incredible worlds</span>,
                            each with <span className="text-neon-purple">unique arcade challenges</span>, to find your way
                            <span className="text-green-400 font-bold"> home to Earth</span>.
                        </p>
                        <p className="text-lg text-text-dim mt-4 italic">
                            &quot;With a bonus surprise waiting on the cosmic journey...&quot; 🌙
                        </p>
                    </div>

                    {/* Stardust Balance with premium effect */}
                    <div className="relative inline-flex items-center gap-4 bg-gradient-to-r from-space-tertiary/80 via-purple-900/40 to-space-tertiary/80 backdrop-blur-md px-10 py-5 rounded-2xl border border-neon-cyan/50 animate-card-glow">
                        <div className="absolute inset-0 rounded-2xl border border-neon-cyan/20 animate-pulse-ring" />
                        <span className="text-yellow-400 text-4xl animate-float">⭐</span>
                        <div className="flex flex-col items-start">
                            <span className="text-4xl font-heading text-white">{progress.stardust.toLocaleString()}</span>
                            <span className="text-text-dim text-xs uppercase tracking-widest">Stardust Collected</span>
                        </div>
                    </div>

                    {/* CTA Button with premium effect */}
                    <Link
                        href={currentPlanet ? `/games/${currentPlanet.id}` : '/games/pluto'}
                        className="mt-10 group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-neon-cyan/20 to-purple-600/20 hover:from-neon-cyan/30 hover:to-purple-600/30 border-2 border-neon-cyan rounded-xl text-neon-cyan font-heading text-2xl transition-all duration-500 hover:scale-110 hover:shadow-[0_0_50px_rgba(0,240,255,0.5)] overflow-hidden"
                    >
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="text-3xl group-hover:animate-bounce">🚀</span>
                        <span className="relative z-10">{currentPlanet ? 'Continue Journey' : 'Begin Your Epic Quest'}</span>
                        <span className="group-hover:translate-x-2 transition-transform text-2xl">→</span>
                    </Link>

                    {/* Quick stats */}
                    <div className="mt-8 flex items-center gap-8 text-text-dim text-sm">
                        <span className="flex items-center gap-2"><span className="text-neon-cyan">🎮</span> 10 Unique Games</span>
                        <span className="flex items-center gap-2"><span className="text-yellow-400">⭐</span> Earn Stardust</span>
                        <span className="flex items-center gap-2"><span className="text-green-400">🏠</span> Reach Earth</span>
                    </div>
                </div>

                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-space-deep via-space-deep/80 to-transparent" />
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

            {/* Continue Playing - Premium Card */}
            {currentPlanet && (
                <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 ${isLoaded ? 'animate-scale-in animation-delay-100' : 'opacity-0'}`}>
                    <div className="relative rounded-2xl border-2 border-neon-cyan/50 bg-gradient-to-br from-space-tertiary via-cyan-900/20 to-space-tertiary backdrop-blur-md p-8 overflow-hidden animate-card-glow group">
                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-nebula" />
                            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-nebula animation-delay-500" />
                        </div>

                        {/* Live indicator bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-neon-cyan to-cyan-500 animate-aurora" />

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                                {/* Planet with orbiting particles */}
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ width: 120, height: 120, left: -10, top: -10, background: `radial-gradient(circle, ${currentPlanet.glowColor}30, transparent 70%)` }} />
                                    <div className="animate-planet-hover">
                                        <PlanetOrb planetId={currentPlanet.id} size={100} />
                                    </div>
                                    {/* Tiny orbiting moon */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-small">
                                        <div className="w-3 h-3 bg-white/60 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]" />
                                        <span className="text-neon-cyan text-sm uppercase tracking-widest font-bold">Now Playing</span>
                                    </div>
                                    <h3 className="font-heading text-3xl md:text-4xl text-white mb-2 group-hover:text-gradient-cosmic transition-all duration-500">
                                        {currentPlanet.name}
                                    </h3>
                                    <p className="text-neon-cyan text-xl font-ui">{currentPlanet.gameName}</p>
                                    {progress.highScores[currentPlanet.id] && (
                                        <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                                            <span className="text-lg">🏆</span>
                                            <span>Best Score: <span className="font-bold text-white">{progress.highScores[currentPlanet.id].toLocaleString()}</span></span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`/games/${currentPlanet.id}`}
                                className="group/btn relative px-12 py-5 bg-gradient-to-r from-neon-cyan/30 to-cyan-600/30 hover:from-neon-cyan/50 hover:to-cyan-600/50 border-2 border-neon-cyan rounded-xl text-neon-cyan font-heading text-2xl transition-all duration-500 hover:scale-110 hover:shadow-[0_0_50px_rgba(0,240,255,0.5)] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                <span className="relative z-10 flex items-center gap-3">
                                    <span className="text-2xl group-hover/btn:animate-bounce">🚀</span>
                                    <span>PLAY NOW</span>
                                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Next Destination - Premium Animated Card */}
            {nextPlanet && (
                <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isLoaded ? 'animate-slide-in-left animation-delay-200' : 'opacity-0'}`}>
                    <div className={`relative overflow-hidden rounded-3xl border-2 p-10 group transition-all duration-500 ${nextPlanet.isHidden
                        ? 'border-pink-500/60 bg-gradient-to-br from-purple-900/60 via-pink-900/30 to-purple-900/60 hover:border-pink-400 hover:shadow-[0_0_60px_rgba(236,72,153,0.3)]'
                        : 'border-neon-purple/50 bg-gradient-to-br from-space-tertiary via-purple-900/30 to-space-tertiary hover:border-neon-purple hover:shadow-[0_0_60px_rgba(168,85,247,0.3)]'
                        }`}>

                        {/* Holographic scan lines effect */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(168,85,247,0.1)_2px,rgba(168,85,247,0.1)_4px)]" />
                        </div>

                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl animate-nebula ${nextPlanet.isHidden ? 'bg-pink-500/20' : 'bg-purple-500/20'}`} />
                            <div className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl animate-nebula animation-delay-500 ${nextPlanet.isHidden ? 'bg-purple-500/15' : 'bg-cyan-500/15'}`} />
                        </div>

                        {/* Animated top border */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${nextPlanet.isHidden ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600' : 'bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600'} animate-aurora`} />

                        {/* Badge - Premium design */}
                        <div className={`absolute top-6 right-6 px-5 py-2 rounded-xl text-sm font-heading tracking-wider flex items-center gap-2 ${nextPlanet.isHidden
                            ? 'bg-gradient-to-r from-pink-600/50 to-purple-600/50 text-pink-100 border border-pink-400/40'
                            : 'bg-gradient-to-r from-purple-600/50 to-neon-purple/50 text-purple-100 border border-purple-400/40'
                            }`}>
                            <span className="animate-pulse">{nextPlanet.isHidden ? '✨' : '🔒'}</span>
                            <span>{nextPlanet.isHidden ? 'SURPRISE REVEAL!' : 'NEXT DESTINATION'}</span>
                        </div>

                        <div className="relative grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <p className="text-text-dim uppercase tracking-[0.2em] mb-3 text-sm font-ui flex items-center gap-2">
                                    {nextPlanet.isHidden ? (
                                        <><span className="text-lg">🌙</span> Hidden Cosmic Challenge</>
                                    ) : (
                                        <>Stage <span className="text-neon-purple font-bold">{nextPlanet.order}</span> of 10</>
                                    )}
                                </p>
                                <h2 className={`font-heading text-5xl md:text-6xl text-white mb-4 group-hover:text-gradient-cosmic transition-all duration-500`}>
                                    {nextPlanet.name}
                                </h2>
                                <p className={`text-2xl md:text-3xl mb-5 font-ui ${nextPlanet.isHidden ? 'text-pink-400' : 'text-neon-purple'}`}>
                                    {nextPlanet.gameName}
                                </p>
                                <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-lg">
                                    {nextPlanet.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-5">
                                    {progress.stardust >= nextPlanet.stardustCost ? (
                                        <button
                                            onClick={() => handleUnlock(nextPlanet)}
                                            disabled={unlockingPlanet === nextPlanet.id}
                                            className={`group/unlock relative px-10 py-4 text-lg font-bold rounded-xl border-2 transition-all duration-500 overflow-hidden ${unlockingPlanet === nextPlanet.id
                                                ? 'bg-purple-500/50 border-purple-400 text-white'
                                                : 'bg-neon-purple/20 hover:bg-neon-purple/40 border-neon-purple text-neon-purple hover:scale-110 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/unlock:translate-x-full transition-transform duration-700" />
                                            <span className="relative z-10 flex items-center gap-2">
                                                <span className={unlockingPlanet === nextPlanet.id ? 'animate-spin' : ''}>{unlockingPlanet === nextPlanet.id ? '⌛' : '🔓'}</span>
                                                <span>{unlockingPlanet === nextPlanet.id ? 'Unlocking...' : 'Unlock & Play'}</span>
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-5">
                                            <button className="px-8 py-4 bg-white/5 text-white/40 rounded-xl cursor-not-allowed border border-white/10 font-heading">
                                                🔒 Locked
                                            </button>
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 px-5 py-3 rounded-xl">
                                                <span className="text-yellow-400 font-bold text-xl">{(nextPlanet.stardustCost - progress.stardust).toLocaleString()}</span>
                                                <span className="text-yellow-400/70 text-sm ml-2">more ⭐ needed</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-text-dim text-sm">
                                    <span className="text-yellow-400">⭐</span>
                                    <span>Unlock Cost: <span className="text-yellow-400 font-bold">{nextPlanet.stardustCost.toLocaleString()}</span></span>
                                </div>
                            </div>

                            {/* Premium Planet Visual */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    {/* Multiple glow rings */}
                                    <div
                                        className="absolute rounded-full animate-pulse-ring"
                                        style={{
                                            background: `radial-gradient(circle, ${nextPlanet.glowColor}30, transparent 60%)`,
                                            width: 280,
                                            height: 280,
                                            left: -30,
                                            top: -30,
                                        }}
                                    />
                                    <div
                                        className="absolute rounded-full animate-pulse-ring animation-delay-500"
                                        style={{
                                            background: `radial-gradient(circle, ${nextPlanet.glowColor}20, transparent 70%)`,
                                            width: 320,
                                            height: 320,
                                            left: -50,
                                            top: -50,
                                        }}
                                    />
                                    <div className={`animate-planet-hover ${unlockingPlanet === nextPlanet.id ? 'animate-unlock-spin' : ''}`}>
                                        <PlanetOrb
                                            planetId={nextPlanet.id}
                                            size={nextPlanet.isHidden ? 160 : 220}
                                        />
                                    </div>
                                    {/* Orbiting particles */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit" style={{ animationDuration: '12s' }}>
                                        <div className="w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}


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
                        {planets.filter(p => !p.isMasterChallenge && !p.isBossChallenge).map((planet) => {
                            const unlocked = isUnlocked(planet.id);
                            const highScore = progress.highScores[planet.id] || 0;
                            const isNext = nextPlanet?.id === planet.id;
                            const isHome = planet.id === 'earth';
                            const isMoon = planet.id === 'moon';
                            const canUnlockNow = isNext && progress.stardust >= planet.stardustCost;

                            // SURPRISE! Hidden planets show as mystery until unlocked
                            const showAsMystery = planet.isHidden && !unlocked;

                            // Make Moon smaller to distinguish it as a "surprise" special world
                            const orbSize = isMoon ? 44 : 56;
                            const cardPadding = isMoon ? 'p-3' : 'p-4';

                            return (
                                <div
                                    key={planet.id}
                                    className={`relative flex flex-col items-center ${cardPadding} rounded-xl transition-all duration-300 hover:scale-105 ${showAsMystery
                                        ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/20 border-2 border-dashed border-purple-500/40'
                                        : isMoon && unlocked
                                            ? 'bg-gradient-to-br from-gray-800/60 to-purple-900/30 border border-pink-500/40 scale-[0.92]'
                                            : unlocked
                                                ? 'bg-space-tertiary/60 hover:bg-space-tertiary border border-green-500/30'
                                                : isNext
                                                    ? 'bg-purple-900/40 border-2 border-neon-purple/60 animate-card-glow'
                                                    : 'bg-space-dark/50 opacity-60 hover:opacity-80'
                                        }`}
                                >
                                    {/* Status badge - Show planet order number */}
                                    <div className={`absolute -top-2 -left-2 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${showAsMystery
                                        ? 'w-7 h-7 bg-purple-600 text-white shadow-purple-500/50 animate-pulse'
                                        : isMoon
                                            ? 'w-6 h-6 bg-pink-500/80 text-white shadow-pink-500/50'
                                            : unlocked
                                                ? 'w-7 h-7 bg-green-500 text-white shadow-green-500/50'
                                                : isNext
                                                    ? 'w-7 h-7 bg-purple-500 text-white shadow-purple-500/50 animate-bounce'
                                                    : 'w-7 h-7 bg-gray-700 text-gray-400'
                                        }`}>
                                        {showAsMystery ? '?' : unlocked ? '✓' : isMoon ? '🌙' : planet.order + 1}
                                    </div>

                                    {/* Special badges */}
                                    {showAsMystery && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-purple-200 text-[10px] rounded-full font-bold animate-pulse border border-purple-400/30">
                                            HIDDEN
                                        </div>
                                    )}
                                    {!showAsMystery && isMoon && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-pink-500/30 text-pink-300 text-[9px] rounded-full font-bold">
                                            SURPRISE
                                        </div>
                                    )}
                                    {!showAsMystery && planet.isBonus && !isMoon && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-500/30 text-yellow-400 text-[10px] rounded-full font-bold">
                                            BONUS
                                        </div>
                                    )}
                                    {!showAsMystery && isHome && !planet.isBonus && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500/30 text-green-400 text-[10px] rounded-full font-bold">
                                            🏠 HOME
                                        </div>
                                    )}
                                    {!showAsMystery && planet.id === 'pluto' && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-cyan-500/30 text-cyan-400 text-[10px] rounded-full font-bold">
                                            FREE
                                        </div>
                                    )}

                                    {/* Planet orb - Mystery or Real */}
                                    {showAsMystery ? (
                                        <div className={`mb-3 ${isMoon ? 'w-11 h-11' : 'w-14 h-14'} rounded-full bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center border-2 border-dashed border-purple-400/50`}>
                                            <span className={`${isMoon ? 'text-xl' : 'text-2xl'} animate-pulse`}>?</span>
                                        </div>
                                    ) : (
                                        <div className={`mb-3 transition-all duration-300 ${!unlocked ? 'grayscale opacity-60' : ''} ${unlocked ? 'animate-float' : ''}`} style={{ animationDelay: `${planet.order * 0.2}s` }}>
                                            <PlanetOrb
                                                planetId={planet.id}
                                                size={orbSize}
                                                animated={unlocked}
                                            />
                                        </div>
                                    )}

                                    <p className={`font-heading ${isMoon ? 'text-xs' : 'text-sm'} ${showAsMystery ? 'text-purple-300' : isMoon && unlocked ? 'text-pink-300' : unlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {showAsMystery ? '???' : planet.name}
                                    </p>

                                    <p className={`text-text-dim ${isMoon ? 'text-[10px]' : 'text-xs'} truncate w-full text-center mt-1`}>
                                        {showAsMystery ? 'Surprise!' : planet.gameName}
                                    </p>

                                    {unlocked ? (
                                        <Link
                                            href={`/games/${planet.id}`}
                                            className={`mt-3 ${isMoon ? 'px-3 py-1' : 'px-4 py-1.5'} bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan text-xs rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]`}
                                        >
                                            PLAY
                                        </Link>
                                    ) : canUnlockNow ? (
                                        <button
                                            onClick={() => handleUnlock(planet)}
                                            className={`mt-3 ${isMoon ? 'px-2 py-1' : 'px-3 py-1.5'} bg-neon-purple/30 hover:bg-neon-purple/50 text-neon-purple text-xs rounded-full transition-all duration-300 hover:scale-110`}
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

            {/* 🏆 MASTER CHALLENGE BANNER - Black Hole Escape */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href="/games/blackhole"
                    className="group relative block rounded-2xl overflow-hidden border-2 border-purple-500/40 hover:border-purple-400/80 transition-all duration-500 hover:shadow-[0_0_60px_rgba(168,85,247,0.3)]"
                >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-black to-orange-950 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 animate-aurora" />

                    {/* Animated stars */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                                style={{
                                    left: `${5 + Math.random() * 90}%`,
                                    top: `${10 + Math.random() * 80}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    opacity: 0.3 + Math.random() * 0.4
                                }}
                            />
                        ))}
                    </div>

                    {/* Black hole visual - left side */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-40 h-40 md:w-56 md:h-56">
                        <div className="absolute inset-0 rounded-full bg-black shadow-[0_0_60px_20px_rgba(168,85,247,0.4)] animate-pulse" />
                        <div className="absolute inset-4 rounded-full border-2 border-orange-500/20 animate-spin" style={{ animationDuration: '15s' }} />
                        <div className="absolute inset-8 rounded-full border border-pink-500/30 animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-12 rounded-full border border-purple-400/20 animate-spin" style={{ animationDuration: '20s' }} />
                    </div>

                    {/* Content */}
                    <div className="relative py-8 px-8 pl-24 md:pl-36 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                <span className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-orange-500/30 text-orange-400 text-sm rounded-full font-bold border border-orange-500/30 animate-pulse">
                                    🏆 MASTER CHALLENGE
                                </span>
                            </div>
                            <h3 className="font-heading text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-1">
                                Black Hole Escape: Event Horizon
                            </h3>
                            <p className="text-purple-300 text-sm md:text-base">
                                Complete this challenge to <span className="text-yellow-400 font-bold">unlock ALL planets instantly!</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-center text-center px-4 border-l border-purple-500/30">
                                <span className="text-2xl mb-1">⏱️</span>
                                <span className="text-purple-300 text-xs">Time Dilation</span>
                            </div>
                            <div className="hidden sm:flex flex-col items-center text-center px-4 border-l border-purple-500/30">
                                <span className="text-2xl mb-1">🌀</span>
                                <span className="text-pink-300 text-xs">Gravity Anchors</span>
                            </div>
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center gap-2">
                                <span>🕳️</span>
                                <span>Enter the Void</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Glowing edge */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-60" />
                </Link>
            </section>

            {/* ☀️ FINAL BOSS CHALLENGE - Solar Showdown */}
            <SunBossChallengeSection />

            {/* How It Works - Scroll Reveal */}

            <section
                ref={howItWorksRef}
                className={`bg-gradient-to-b from-space-secondary/30 to-space-deep border-y border-white/5 py-20 transition-all duration-1000 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
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

            {/* Educational Section - Scroll Reveal */}
            <section
                ref={educationRef}
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-all duration-1000 delay-100 ${educationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
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

            {/* Blog Section - Scroll Reveal */}
            <section
                ref={blogRef}
                className={`py-16 bg-gradient-to-b from-space-dark to-space-deep transition-all duration-1000 ${blogVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-3xl md:text-4xl text-neon-cyan mb-4">
                            📚 Space Learning Blog
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Dive deeper into the wonders of our universe with educational articles
                            about planets, space phenomena, and cosmic mysteries.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Link href="/blog/why-is-neptune-blue" className="group">
                            <article className="planet-card h-full hover:border-neon-cyan/60 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-900/10">
                                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🔵</span>
                                <h3 className="font-heading text-lg text-white group-hover:text-neon-cyan transition-colors mb-2">
                                    Why Is Neptune Blue?
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    Discover the science behind the ice giant&apos;s stunning azure color.
                                </p>
                            </article>
                        </Link>

                        <Link href="/blog/jupiter-great-red-spot" className="group">
                            <article className="planet-card h-full hover:border-neon-orange/60 transition-all duration-300 hover:scale-[1.02] hover:bg-orange-900/10">
                                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🌪️</span>
                                <h3 className="font-heading text-lg text-white group-hover:text-neon-cyan transition-colors mb-2">
                                    Jupiter&apos;s Great Red Spot
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    A storm bigger than Earth that has raged for over 400 years.
                                </p>
                            </article>
                        </Link>

                        <Link href="/blog/venus-hottest-planet" className="group">
                            <article className="planet-card h-full hover:border-red-500/60 transition-all duration-300 hover:scale-[1.02] hover:bg-red-900/10">
                                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🔥</span>
                                <h3 className="font-heading text-lg text-white group-hover:text-neon-cyan transition-colors mb-2">
                                    Why Is Venus Hotter Than Mercury?
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    Learn about the runaway greenhouse effect and its implications.
                                </p>
                            </article>
                        </Link>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 rounded-lg text-neon-cyan transition-all duration-300 hover:scale-105"
                        >
                            <span>📖</span>
                            <span>View All Articles</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>


            {/* Achievements Section */}
            <section className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h2 className="font-heading text-2xl text-white mb-2">🏆 Your Achievements</h2>
                    <p className="text-text-dim text-sm">Unlock badges as you explore the solar system</p>
                </div>
                <AchievementsDisplay />
            </section>


            {/* Rotating Fun Facts */}
            <RotatingFunFacts />

        </div>
    );
}
