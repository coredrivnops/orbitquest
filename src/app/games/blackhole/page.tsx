'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import { BlackHoleGameLogic } from '@/games/blackhole/BlackHoleGameLogic';
import { addStardust, updateHighScore, loadProgress, saveProgress, markGamePlayed } from '@/lib/localStorage';
import { isMasterChallengeUnlocked, getGamesRequiredForMasterChallenge, PLANETS } from '@/lib/gameTypes';
import Link from 'next/link';
import Confetti from '@/components/Confetti';

export default function BlackHoleGamePage() {
    const gameLogicRef = useRef<BlackHoleGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [rescued, setRescued] = useState(0);
    const [lost, setLost] = useState(0);
    const [wave, setWave] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [hasEscaped, setHasEscaped] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [allUnlocked, setAllUnlocked] = useState(false);
    const [showTrivia, setShowTrivia] = useState(false);

    // Unlock state
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [gamesNeeded, setGamesNeeded] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check if master challenge is unlocked (requires 3 games played)
    useEffect(() => {
        const progress = loadProgress();
        const gamesPlayed = progress.gamesPlayedAtLeastOnce || [];
        const unlocked = isMasterChallengeUnlocked(gamesPlayed);
        setIsUnlocked(unlocked);

        if (!unlocked) {
            const required = getGamesRequiredForMasterChallenge();
            const needed = required.filter(id => !gamesPlayed.includes(id));
            setGamesNeeded(needed);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isUnlocked) {
            gameLogicRef.current = new BlackHoleGameLogic(1280, 720);
        }
        return () => {
            gameLogicRef.current = null;
        };
    }, [isUnlocked]);

    // Mouse movement handler
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying || isGameOver) return;

        const target = e.currentTarget;
        const canvas = target.querySelector('canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        game.handleInput(x, y);
    }, [isPlaying, isGameOver]);

    // Click handler for trivia answers
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const target = e.currentTarget;
        const canvas = target.querySelector('canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Check if clicking trivia button
        if (game.showTrivia && !game.triviaAnswered) {
            const buttons = game.getTriviaButtonBounds();
            for (const btn of buttons) {
                if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
                    game.answerTrivia(btn.index);
                    break;
                }
            }
        }
    }, [isPlaying]);

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying && !isGameOver) {
            game.update();
        }
        game.draw(ctx);

        if (frameCount % 6 === 0) {
            setScore(game.score);
            setRescued(game.rescued);
            setLost(game.lost);
            setWave(game.wave);
            setShowTrivia(game.showTrivia);

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.hasEscaped, game);
            }
        }
    };

    const handleGameOver = (finalScore: number, escaped: boolean, game: BlackHoleGameLogic) => {
        setIsGameOver(true);
        setHasEscaped(escaped);

        let stardust = Math.floor(finalScore / 50);

        if (escaped) {
            stardust += 5000;
            setShowConfetti(true);

            // UNLOCK ALL PLANETS!
            const progress = loadProgress();
            progress.stardust += 50000;
            progress.unlockedPlanets = [
                'pluto', 'neptune', 'uranus', 'saturn', 'jupiter',
                'mars', 'venus', 'mercury', 'earth', 'moon'
            ];
            saveProgress(progress);
            setAllUnlocked(true);
        }

        setEarnedStardust(stardust);
        addStardust(stardust);
        updateHighScore('blackhole', finalScore);
        markGamePlayed('blackhole');

        window.dispatchEvent(new CustomEvent('stardust-earned', {
            detail: { amount: stardust }
        }));
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setHasEscaped(false);
        setShowConfetti(false);
        setAllUnlocked(false);
        setScore(0);
        setRescued(0);
        setLost(0);
        setWave(1);
        setEarnedStardust(0);
    };

    return (
        <>
            {showConfetti && <Confetti active={showConfetti} />}
            <Header />

            {/* Loading State */}
            {isLoading && (
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin text-6xl">🌀</div>
                </main>
            )}

            {/* Locked State */}
            {!isLoading && !isUnlocked && (
                <main className="flex-1 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="planet-card bg-gradient-to-br from-purple-900/30 via-slate-900/20 to-green-900/20 text-center py-12">
                            {/* Locked Black Hole */}
                            <div className="relative mx-auto w-48 h-48 mb-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-green-500/30 rounded-full blur-xl animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-8xl grayscale opacity-50">🌀</span>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl">🔒</span>
                                    </div>
                                </div>
                            </div>

                            <h1 className="font-heading text-4xl md:text-5xl text-white mb-4">
                                Master Challenge: <span className="text-purple-400">Black Hole</span>
                            </h1>

                            <p className="text-xl text-purple-200 mb-6 max-w-lg mx-auto">
                                The ultimate test awaits... but first, prove your worth by completing the early journey!
                            </p>

                            <div className="bg-space-tertiary/60 rounded-xl p-6 mb-8 border border-purple-500/30 max-w-md mx-auto">
                                <h2 className="text-lg text-purple-400 font-bold mb-4">
                                    🎮 Complete 3 games to unlock this challenge
                                </h2>

                                <div className="flex justify-center gap-2 mb-4">
                                    <span className="text-2xl text-green-400">{3 - gamesNeeded.length}</span>
                                    <span className="text-2xl text-text-dim">/</span>
                                    <span className="text-2xl text-purple-400">3</span>
                                    <span className="text-text-dim ml-2">games played</span>
                                </div>

                                <div className="w-full h-4 bg-space-dark rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500"
                                        style={{ width: `${((3 - gamesNeeded.length) / 3) * 100}%` }}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center">
                                    {gamesNeeded.map(id => {
                                        const planet = PLANETS.find(p => p.id === id);
                                        return (
                                            <Link
                                                key={id}
                                                href={`/games/${id}`}
                                                className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm hover:bg-red-500/40 transition-colors"
                                            >
                                                {planet?.name || id}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-space-tertiary hover:bg-space-secondary text-white rounded-xl transition-colors"
                            >
                                ← Return to Mission Control
                            </Link>
                        </div>
                    </div>
                </main>
            )}

            {/* Game Content (when unlocked) */}
            {!isLoading && isUnlocked && (
                <main className="flex-1 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Game Header */}
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="font-heading text-3xl bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 text-transparent bg-clip-text">
                                        Singularity Rescue
                                    </h1>
                                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-green-500/30 text-green-400 text-sm rounded-full font-bold border border-green-500/30 animate-pulse">
                                        🏆 MASTER CHALLENGE
                                    </span>
                                </div>
                                <p className="text-text-secondary font-ui">
                                    Save 50 survivors to unlock ALL planets!
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-heading text-2xl text-green-400">
                                    🧑‍🚀 {rescued}/50 Rescued
                                </p>
                                {wave > 1 && (
                                    <p className="text-purple-400 font-bold">Wave {wave}</p>
                                )}
                            </div>
                        </div>

                        {/* Game Container */}
                        <div
                            className="game-canvas-container relative touch-none select-none"
                            onMouseMove={handleMouseMove}
                            onClick={handleClick}
                            style={{ cursor: isPlaying && !isGameOver && !showTrivia ? 'none' : 'default' }}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* Start Overlay */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <div className="relative mb-6">
                                        <h2 className="font-heading text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 tracking-wider">
                                            SINGULARITY RESCUE
                                        </h2>
                                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-green-500/20 blur-xl -z-10" />
                                    </div>

                                    <p className="text-purple-300 text-xl mb-2">Indie-Style Space Rescue!</p>
                                    <p className="text-yellow-400 text-lg mb-8 font-bold animate-pulse">🏆 RESCUE 50 SURVIVORS TO UNLOCK ALL PLANETS! 🏆</p>

                                    {/* How to Play */}
                                    <div className="max-w-3xl mb-8">
                                        <div className="grid grid-cols-4 gap-4 text-sm mb-6">
                                            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-xl border border-purple-500/30">
                                                <div className="text-4xl mb-2">🖱️</div>
                                                <p className="text-purple-400 font-bold">MOUSE</p>
                                                <p className="text-text-dim text-xs mt-1">Controls your ship</p>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-xl border border-purple-500/30">
                                                <div className="text-4xl mb-2">🧑‍🚀</div>
                                                <p className="text-green-400 font-bold">RESCUE</p>
                                                <p className="text-text-dim text-xs mt-1">Touch drifting survivors</p>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-xl border border-purple-500/30">
                                                <div className="text-4xl mb-2">🏠</div>
                                                <p className="text-cyan-400 font-bold">DELIVER</p>
                                                <p className="text-text-dim text-xs mt-1">Bring to green safe zone</p>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-xl border border-purple-500/30">
                                                <div className="text-4xl mb-2">🕳️</div>
                                                <p className="text-red-400 font-bold">AVOID</p>
                                                <p className="text-text-dim text-xs mt-1">Stay away from singularity!</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 justify-center text-sm">
                                            <span className="px-3 py-1 bg-green-900/40 rounded-full text-green-400 border border-green-500/30">
                                                🧑‍🚀 Astronauts
                                            </span>
                                            <span className="px-3 py-1 bg-blue-900/40 rounded-full text-blue-400 border border-blue-500/30">
                                                📡 Satellites
                                            </span>
                                            <span className="px-3 py-1 bg-purple-900/40 rounded-full text-purple-400 border border-purple-500/30">
                                                👽 Aliens
                                            </span>
                                            <span className="px-3 py-1 bg-orange-900/40 rounded-full text-orange-400 border border-orange-500/30">
                                                Carry up to 3!
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="group relative px-12 py-5 text-xl font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-green-600 animate-gradient-x" />
                                        <div className="absolute inset-0.5 bg-space-deep rounded-xl" />
                                        <span className="relative text-white flex items-center gap-3">
                                            <span className="text-2xl">🚀</span>
                                            <span>START RESCUE</span>
                                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Game Over - Failed */}
                            {isGameOver && !hasEscaped && (
                                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <div className="w-24 h-24 rounded-full bg-black border-4 border-red-500/50 shadow-[0_0_50px_20px_rgba(239,68,68,0.3)] mb-6 flex items-center justify-center">
                                        <span className="text-4xl">💔</span>
                                    </div>

                                    <h2 className="font-heading text-5xl text-red-400 mb-2">MISSION FAILED</h2>
                                    <p className="text-purple-300 mb-6 text-lg">
                                        {lost >= 5 ? 'Too many survivors were lost to the void...' : 'Your ship was consumed by the singularity!'}
                                    </p>

                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-yellow-500/30">
                                            <p className="text-3xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                            <p className="text-text-dim text-xs">Stardust</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-green-500/30">
                                            <p className="text-3xl font-bold text-green-400">{rescued}</p>
                                            <p className="text-text-dim text-xs">Rescued</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-red-500/30">
                                            <p className="text-3xl font-bold text-red-400">{lost}</p>
                                            <p className="text-text-dim text-xs">Lost</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-purple-500/30">
                                            <p className="text-3xl font-bold text-purple-400">{wave}</p>
                                            <p className="text-text-dim text-xs">Wave</p>
                                        </div>
                                    </div>

                                    <p className="text-3xl font-bold text-white mb-6">Score: {score.toLocaleString()}</p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                        >
                                            🔄 TRY AGAIN
                                        </button>
                                        <Link href="/" className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                                            Return to Hub
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Game Over - SUCCESS! */}
                            {isGameOver && hasEscaped && (
                                <div className="absolute inset-0 bg-gradient-to-b from-green-950/95 via-black/90 to-purple-950/95 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <div className="relative mb-4">
                                        <div className="text-8xl animate-bounce">🦸</div>
                                        <div className="absolute inset-0 text-8xl animate-ping opacity-30">🦸</div>
                                    </div>

                                    <h2 className="font-heading text-6xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 mb-2 animate-pulse">
                                        HERO OF THE VOID!
                                    </h2>
                                    <p className="text-green-300 mb-2 text-xl">You saved {rescued} survivors from the singularity!</p>

                                    {allUnlocked && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl border-2 border-yellow-500/50 animate-pulse">
                                            <p className="text-2xl font-bold text-yellow-400 mb-1">🎉 ALL PLANETS UNLOCKED! 🎉</p>
                                            <p className="text-yellow-200 text-sm">Your heroism has opened the entire solar system!</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-yellow-500/30">
                                            <p className="text-3xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                            <p className="text-text-dim text-xs">Stardust</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-green-500/30">
                                            <p className="text-3xl font-bold text-green-400">{rescued}</p>
                                            <p className="text-text-dim text-xs">Rescued</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-purple-500/30">
                                            <p className="text-3xl font-bold text-purple-400">{wave}</p>
                                            <p className="text-text-dim text-xs">Waves</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-4 rounded-xl border border-cyan-500/30">
                                            <p className="text-3xl font-bold text-cyan-400">{score.toLocaleString()}</p>
                                            <p className="text-text-dim text-xs">Score</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-500 hover:to-yellow-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                        >
                                            🔄 PLAY AGAIN
                                        </button>
                                        <Link
                                            href="/"
                                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold transition-all hover:scale-105"
                                        >
                                            🚀 Explore All Planets!
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Educational Content */}
                        <section className="mt-8 space-y-8">
                            <article className="planet-card bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-green-900/30">
                                <h2 className="font-heading text-3xl bg-gradient-to-r from-purple-400 to-green-400 text-transparent bg-clip-text mb-6">
                                    🕳️ Black Holes: The Ultimate Force of Nature
                                </h2>
                                <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                    <p className="text-lg">
                                        Black holes are cosmic regions where gravity is so intense that nothing—not even light—can escape.
                                        They form when massive stars (at least 3x our Sun&apos;s mass) exhaust their nuclear fuel and collapse
                                        under their own gravity. The boundary around a black hole from which nothing can escape is called the
                                        <strong className="text-purple-400"> event horizon</strong>.
                                    </p>

                                    <div className="bg-purple-900/30 p-6 rounded-lg border-l-4 border-purple-500 my-6">
                                        <p className="font-ui text-purple-400 font-bold mb-2">🎮 GAME PHYSICS</p>
                                        <p>
                                            The gravitational pull you experience in this game is based on real physics!
                                            Objects closer to the singularity experience stronger acceleration,
                                            just like in Einstein&apos;s theory of general relativity. The closer you get,
                                            the harder it is to escape!
                                        </p>
                                    </div>

                                    <h3 className="font-heading text-xl text-green-400 mt-8 mb-4">⏰ Time Dilation</h3>
                                    <p>
                                        Near a black hole, time slows down dramatically due to the extreme gravitational field.
                                        If you could watch someone fall into a black hole, you would see them appear to slow down
                                        and freeze at the event horizon, even though from their perspective they would fall right through.
                                        This phenomenon, predicted by Einstein, has been confirmed by experiments on Earth!
                                    </p>

                                    <h3 className="font-heading text-xl text-green-400 mt-8 mb-4">💫 Hawking Radiation</h3>
                                    <p>
                                        Discovered theoretically by Stephen Hawking in 1974, black holes aren&apos;t completely black!
                                        Quantum mechanics predicts that black holes slowly emit radiation and eventually evaporate
                                        over incredibly long timescales. A stellar black hole would take longer than the current
                                        age of the universe to evaporate!
                                    </p>
                                </div>
                            </article>

                            {/* Quick Facts Grid */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="planet-card">
                                    <h3 className="font-heading text-xl text-purple-400 mb-4">📊 Black Hole Facts</h3>
                                    <ul className="space-y-3 text-sm text-text-secondary">
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Escape Velocity</span>
                                            <span className="text-purple-400">&gt; Speed of Light</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Smallest Type</span>
                                            <span className="text-purple-400">~3 Solar Masses</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Largest (Supermassive)</span>
                                            <span className="text-purple-400">Billions of Suns</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Nearest Known</span>
                                            <span className="text-purple-400">~1,000 light years</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>First Image</span>
                                            <span className="text-purple-400">M87* (2019)</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="planet-card">
                                    <h3 className="font-heading text-xl text-pink-400 mb-4">🔬 Types of Black Holes</h3>
                                    <ul className="space-y-3 text-sm text-text-secondary">
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400">⭐</span>
                                            <span><strong>Stellar</strong> - From collapsed stars (3-100 suns)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400">🌀</span>
                                            <span><strong>Supermassive</strong> - Galaxy centers (millions-billions)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400">🔮</span>
                                            <span><strong>Intermediate</strong> - Rare middle-sized (~1000 suns)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400">✨</span>
                                            <span><strong>Primordial</strong> - Theoretical, from Big Bang</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="planet-card">
                                    <h3 className="font-heading text-xl text-green-400 mb-4">🎯 Game Tips</h3>
                                    <ul className="space-y-3 text-sm text-text-secondary">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Rescue 50 survivors to escape and win!</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Stay near the edge for easier rescues</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Answer trivia correctly for bonus stardust</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Victory unlocks ALL planets instantly!</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            )}

            <Footer />

            <style jsx global>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }
            `}</style>
        </>
    );
}
