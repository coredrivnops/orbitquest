'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { JupiterGameLogic } from '@/games/jupiter/JupiterGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function JupiterGamePage() {
    const gameLogicRef = useRef<JupiterGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [stormsDodged, setStormsDodged] = useState(0);
    const [combo, setCombo] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [hasShield, setHasShield] = useState(false);
    const [hasMagnet, setHasMagnet] = useState(false);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new JupiterGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                gameLogicRef.current?.setRising(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                gameLogicRef.current?.setRising(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleMouseDown = useCallback(() => {
        gameLogicRef.current?.setRising(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        gameLogicRef.current?.setRising(false);
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        gameLogicRef.current?.setRising(true);
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        gameLogicRef.current?.setRising(false);
    }, []);

    const handleGameLoop = useCallback((ctx: CanvasRenderingContext2D, frameCount: number, deltaTime: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying && !showTrivia) {
            game.update(deltaTime);
        }
        game.draw(ctx);

        if (frameCount % 6 === 0) {
            const state = game.getState();
            setScore(state.score);
            setDistance(state.distance);
            setStormsDodged(state.stormsDodged);
            setCombo(state.combo);
            setEarnedStardust(state.stardustCollected);
            setHasShield(state.hasShield);
            setHasMagnet(state.hasMagnet);

            // Check for trivia trigger
            if (state.showTrivia && !showTrivia && state.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(state.currentTrivia);
                setTriviaAnswered(false);
            }

            if (state.isGameOver && !isGameOver) {
                handleGameOver(state.score, state.stardustCollected, state.stormsDodged);
            }
        }
    }, [isPlaying, showTrivia, isGameOver]);

    const handleGameOver = (finalScore: number, stardust: number, storms: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setStormsDodged(storms);

        addStardust(stardust);
        updateHighScore('jupiter', finalScore);
        markGamePlayed('jupiter');

        window.dispatchEvent(new CustomEvent('stardust-earned', {
            detail: { amount: stardust }
        }));
    };

    const handleTriviaAnswer = (index: number) => {
        const game = gameLogicRef.current;
        if (!game || triviaAnswered) return;

        game.answerTrivia(index);
        setTriviaAnswered(true);
        setTriviaCorrect(index === triviaQuestion?.correct);

        setTimeout(() => {
            setShowTrivia(false);
            setTriviaQuestion(null);
            setTriviaAnswered(false);
        }, 2500);
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setShowTrivia(false);
        setScore(0);
        setDistance(0);
        setStormsDodged(0);
        setCombo(1);
        setEarnedStardust(0);
        setHasShield(false);
        setHasMagnet(false);
    };

    return (
        <>
            <Header />

            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Game Header */}
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="font-heading text-3xl text-orange-400">Jupiter: Storm Rider 🌪️</h1>
                                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full font-bold">80⭐</span>
                            </div>
                            <p className="text-text-secondary font-ui">
                                Ride through Jupiter&apos;s bands! Dodge storms from the Great Red Spot!
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-heading text-2xl text-orange-400">{Math.floor(distance / 10).toLocaleString()}km</p>
                            {combo > 1 && (
                                <p className="text-pink-400 font-bold">🔥 x{combo} Combo!</p>
                            )}
                        </div>
                    </div>

                    {/* Status Display */}
                    {isPlaying && !isGameOver && (
                        <div className="mb-4 flex gap-4 items-center justify-between bg-gradient-to-r from-orange-900/30 to-yellow-900/30 p-3 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-dim">🌪️ STORMS:</span>
                                    <span className="font-bold text-orange-400">{stormsDodged}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-dim">⭐ STARDUST:</span>
                                    <span className="font-bold text-yellow-400">{earnedStardust}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {hasShield && (
                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-cyan-500/30 text-cyan-400 border border-cyan-500/50">
                                        🛡️ SHIELD
                                    </span>
                                )}
                                {hasMagnet && (
                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-500/30 text-yellow-400 border border-yellow-500/50">
                                        🧲 MAGNET
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-white text-lg">{score.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Game Container */}
                    <PlanetGuard planetId="jupiter">
                        <div
                            className="game-canvas-container relative cursor-pointer touch-none select-none"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* Start Overlay */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 bg-gradient-to-b from-orange-950/95 to-amber-950/95 flex flex-col items-center justify-center p-4 text-center z-10 overflow-hidden">
                                    {/* Epic title */}
                                    <div className="relative mb-6">
                                        <h2 className="font-heading text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 tracking-wider">
                                            🌪️ STORM RIDER
                                        </h2>
                                        <p className="text-orange-300 text-lg mt-2">Race through Jupiter&apos;s atmospheric bands!</p>
                                    </div>

                                    {/* Simple Controls */}
                                    <div className="bg-orange-900/40 p-6 rounded-xl border border-orange-500/30 mb-6 max-w-lg">
                                        <p className="text-orange-400 font-bold mb-4 text-xl">🎮 SUPER EASY CONTROLS</p>
                                        <div className="grid grid-cols-2 gap-6 text-center">
                                            <div className="bg-orange-800/30 p-4 rounded-lg">
                                                <p className="text-4xl mb-2">👆</p>
                                                <p className="text-white font-bold">
                                                    <span className="hidden md:inline">CLICK / HOLD</span>
                                                    <span className="md:hidden">TAP / HOLD</span>
                                                </p>
                                                <p className="text-orange-300 text-sm">Rise up!</p>
                                            </div>
                                            <div className="bg-amber-800/30 p-4 rounded-lg">
                                                <p className="text-4xl mb-2">👇</p>
                                                <p className="text-white font-bold">RELEASE</p>
                                                <p className="text-amber-300 text-sm">Fall down!</p>
                                            </div>
                                        </div>
                                        <p className="text-text-dim text-sm mt-4">Or use SPACE / ↑ Arrow key!</p>
                                    </div>

                                    {/* What to do */}
                                    <div className="flex gap-4 mb-6">
                                        <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30 text-center">
                                            <p className="text-2xl">⭐</p>
                                            <p className="text-green-400 font-bold text-sm">COLLECT</p>
                                            <p className="text-text-dim text-xs">Stardust</p>
                                        </div>
                                        <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30 text-center">
                                            <p className="text-2xl">🌪️</p>
                                            <p className="text-red-400 font-bold text-sm">AVOID</p>
                                            <p className="text-text-dim text-xs">Storm clouds</p>
                                        </div>
                                        <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30 text-center">
                                            <p className="text-2xl">🌙</p>
                                            <p className="text-purple-400 font-bold text-sm">GRAB</p>
                                            <p className="text-text-dim text-xs">Moon power-ups!</p>
                                        </div>
                                    </div>

                                    {/* Moon power-ups explanation */}
                                    <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/20 mb-6 max-w-lg text-sm">
                                        <p className="text-indigo-300">
                                            💡 <strong>Moon Power-ups:</strong> Io gives bonus ⭐, Europa gives 🛡️ shield,
                                            Ganymede attracts 🧲 stardust, Callisto ⏱️ slows time!
                                        </p>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="group relative px-12 py-5 text-xl font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 animate-gradient-x"></div>
                                        <div className="absolute inset-0.5 bg-space-deep rounded-xl"></div>
                                        <span className="relative text-white flex items-center gap-3">
                                            <span className="text-2xl">🚀</span>
                                            <span>RIDE THE STORM!</span>
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Trivia Overlay */}
                            {showTrivia && triviaQuestion && (
                                <div className="absolute inset-0 bg-gradient-to-b from-orange-950/98 to-red-950/98 flex flex-col items-center justify-center p-8 text-center z-20 backdrop-blur-sm">
                                    <div className="text-5xl mb-4 animate-bounce">🪐</div>
                                    <h3 className="font-heading text-3xl text-orange-400 mb-4">JUPITER TRIVIA!</h3>
                                    <p className="text-white text-2xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                    {!triviaAnswered ? (
                                        <>
                                            <p className="text-yellow-400 mb-6 text-lg">Answer correctly for <span className="font-bold">+15⭐</span> and 🛡️ Shield!</p>
                                            <div className="grid grid-cols-2 gap-4 max-w-xl w-full">
                                                {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleTriviaAnswer(idx)}
                                                        className="p-5 bg-orange-800/50 hover:bg-orange-700/60 border-2 border-orange-400/40 hover:border-orange-300 rounded-xl text-white text-lg font-medium transition-all hover:scale-105"
                                                    >
                                                        {answer}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="max-w-lg animate-fadeIn">
                                            <div className={`text-5xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {triviaCorrect ? '✅ CORRECT! +15⭐ +🛡️!' : '❌ WRONG!'}
                                            </div>
                                            <div className="bg-orange-900/60 p-6 rounded-xl border border-orange-400/30">
                                                <p className="text-orange-200 text-lg">
                                                    💡 {triviaQuestion.fact}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Game Over */}
                            {isGameOver && (
                                <div className="absolute inset-0 bg-gradient-to-b from-red-950/95 to-orange-950/95 flex flex-col items-center justify-center p-8 text-center z-10 backdrop-blur-sm">
                                    <div className="text-6xl mb-4">💥</div>
                                    <h2 className="font-heading text-5xl text-red-400 mb-2">
                                        CAUGHT IN THE STORM!
                                    </h2>
                                    <p className="text-orange-300 mb-6 italic text-lg">
                                        The Great Red Spot claims another probe...
                                    </p>

                                    <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-orange-500/30">
                                            <p className="text-4xl font-bold text-orange-400">{Math.floor(distance / 10).toLocaleString()}km</p>
                                            <p className="text-text-dim text-sm">Distance</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-red-500/30">
                                            <p className="text-4xl font-bold text-red-400">🌪️ {stormsDodged}</p>
                                            <p className="text-text-dim text-sm">Storms Dodged</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-yellow-500/30">
                                            <p className="text-4xl font-bold text-yellow-400">⭐ {earnedStardust}</p>
                                            <p className="text-text-dim text-sm">Stardust Earned</p>
                                        </div>
                                    </div>

                                    <p className="text-3xl font-bold text-white mb-6">Score: {score.toLocaleString()}</p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                        >
                                            🚀 RIDE AGAIN
                                        </button>
                                        <Link href="/" className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                                            Return to Hub
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </PlanetGuard>


                    {/* Educational Content */}
                    <section className="mt-8 space-y-12">

                        <article className="planet-card bg-gradient-to-br from-orange-900/30 to-red-900/20">
                            <h2 className="font-heading text-3xl text-orange-400 mb-6">
                                🌪️ Jupiter&apos;s Incredible Storms
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    Jupiter is home to the most <strong className="text-orange-400">violent storms</strong> in our solar system!
                                    The Great Red Spot is a massive anticyclonic storm that has been raging for at least 400 years -
                                    possibly much longer. It&apos;s so big that <strong>Earth could fit inside it twice</strong>!
                                </p>

                                <h3 className="font-heading text-xl text-red-400 mt-8 mb-4">The Great Red Spot</h3>
                                <p>
                                    The iconic Great Red Spot is a high-pressure region in Jupiter&apos;s atmosphere producing
                                    winds up to 400 mph (644 km/h). Its distinctive red color comes from chemicals brought up
                                    from deep within Jupiter&apos;s atmosphere. Despite shrinking over the past century,
                                    it remains the largest storm in our solar system!
                                </p>

                                <div className="bg-orange-900/30 p-6 rounded-lg border-l-4 border-red-500 my-8">
                                    <p className="font-ui text-red-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        In Storm Rider, the Great Red Spot on the left side of the screen is the source
                                        of all the storms you&apos;re dodging! As Jupiter&apos;s bands scroll past,
                                        you&apos;re essentially flying through the turbulent atmosphere near this
                                        legendary storm system!
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl text-amber-400 mt-8 mb-4">Jupiter&apos;s Colorful Bands</h3>
                                <p>
                                    Jupiter&apos;s distinctive banded appearance comes from clouds of ammonia and other compounds
                                    at different altitudes. The light-colored bands (zones) are high-altitude clouds, while
                                    dark bands (belts) are lower-altitude windows into the deeper atmosphere. Massive jet
                                    streams traveling up to 360 mph separate these bands!
                                </p>
                            </div>
                        </article>

                        {/* Jupiter's Moons as Power-ups */}
                        <div className="planet-card">
                            <h3 className="font-heading text-2xl text-orange-400 mb-6">🌙 Jupiter&apos;s Power-Up Moons</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
                                    <p className="text-amber-400 font-bold text-lg">Io 🔥</p>
                                    <p className="text-sm text-amber-300 mb-2">+⭐ BONUS</p>
                                    <p className="text-text-dim text-sm">Most volcanic body in the solar system! Over 400 active volcanoes.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-sky-900/20 border border-sky-500/30">
                                    <p className="text-sky-400 font-bold text-lg">Europa 🛡️</p>
                                    <p className="text-sm text-sky-300 mb-2">SHIELD</p>
                                    <p className="text-text-dim text-sm">Has a subsurface ocean that may harbor life!</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-700/20 border border-gray-500/30">
                                    <p className="text-gray-300 font-bold text-lg">Ganymede 🧲</p>
                                    <p className="text-sm text-gray-400 mb-2">MAGNET</p>
                                    <p className="text-text-dim text-sm">Largest moon in the solar system - bigger than Mercury!</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-800/20 border border-gray-600/30">
                                    <p className="text-gray-400 font-bold text-lg">Callisto ⏱️</p>
                                    <p className="text-sm text-gray-500 mb-2">SLOW-MO</p>
                                    <p className="text-text-dim text-sm">Most heavily cratered object known!</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Facts */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-orange-400 mb-4">📊 Jupiter Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Size</span>
                                        <span className="text-orange-400">11x Earth diameter</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Earths that fit inside</span>
                                        <span className="text-orange-400">Over 1,300!</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Day Length</span>
                                        <span className="text-orange-400">~10 hours</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Moons</span>
                                        <span className="text-orange-400">95 confirmed</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Great Red Spot Age</span>
                                        <span className="text-red-400">400+ years!</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Has Rings?</span>
                                        <span className="text-yellow-400">Yes! (Faint)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card bg-gradient-to-br from-red-900/20 to-orange-900/20">
                                <h3 className="font-heading text-xl text-red-400 mb-4">🌪️ Storm Facts</h3>
                                <div className="space-y-3 text-sm text-text-dim">
                                    <p className="border-l-2 border-red-500 pl-3">
                                        The Great Red Spot&apos;s winds reach <strong className="text-red-400">400 mph</strong> -
                                        twice as fast as Earth&apos;s strongest hurricanes!
                                    </p>
                                    <p className="border-l-2 border-orange-500 pl-3">
                                        Jupiter has <strong className="text-orange-400">lightning storms</strong>
                                        that are 1,000 times more powerful than Earth&apos;s!
                                    </p>
                                    <p className="border-l-2 border-yellow-500 pl-3">
                                        The planet&apos;s jet streams reach speeds of
                                        <strong className="text-yellow-400"> 360 mph</strong>!
                                    </p>
                                    <p className="border-l-2 border-amber-500 pl-3">
                                        Despite its size, Jupiter completes a full rotation in just
                                        <strong className="text-amber-400"> 10 hours</strong>!
                                    </p>
                                </div>
                            </div>
                        </div>

                    </section>


                </div>
            </main>

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

