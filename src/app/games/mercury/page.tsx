'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { MercuryGameLogic } from '@/games/mercury/MercuryGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function MercuryGamePage() {
    const gameLogicRef = useRef<MercuryGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [heat, setHeat] = useState(0);
    const [shieldPower, setShieldPower] = useState(50);
    const [timeAlive, setTimeAlive] = useState(0);
    const [level, setLevel] = useState(1);
    const [inShadow, setInShadow] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new MercuryGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    // Handle keyboard input
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            game.handleInput('boost-start');
        }
        if (e.key === 'Shift') {
            e.preventDefault();
            game.handleInput('shield-start');
        }
    }, [isPlaying]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
            game.handleInput('boost-stop');
        }
        if (e.key === 'Shift') {
            game.handleInput('shield-stop');
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying) {
            game.update();
        }
        game.draw(ctx);

        if (frameCount % 6 === 0) {
            setScore(game.score);
            setHeat(Math.floor(game.heat));
            setShieldPower(Math.floor(game.shieldPower));
            setTimeAlive(Math.floor(game.timeAlive / 60));
            setLevel(game.level);
            setInShadow(game.isInShadow());
            setEarnedStardust(game.stardustCollected);

            // Check for trivia trigger
            if (game.showTrivia && !showTrivia && game.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(game.currentTrivia);
                setTriviaAnswered(false);
            }

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.stardustCollected, game.timeAlive);
            }
        }
    };

    const handleGameOver = (finalScore: number, stardust: number, finalTime: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setTimeAlive(Math.floor(finalTime / 60));

        addStardust(stardust);
        updateHighScore('mercury', finalScore);
        markGamePlayed('mercury');

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

    // Touch controls
    const handleTouchStart = () => {
        const game = gameLogicRef.current;
        if (game && isPlaying) {
            game.handleInput('boost-start');
        }
    };

    const handleTouchEnd = () => {
        const game = gameLogicRef.current;
        if (game) {
            game.handleInput('boost-stop');
        }
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setShowTrivia(false);
        setScore(0);
        setHeat(0);
        setShieldPower(50);
        setTimeAlive(0);
        setLevel(1);
        setInShadow(true);
        setEarnedStardust(0);
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
                                <h1 className="font-heading text-3xl text-gray-400">Mercury: Sun Chaser</h1>
                                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full font-bold">2000⭐</span>
                            </div>
                            <p className="text-text-secondary font-ui">
                                Outrun the sunrise! Stay in the shadow zone to survive!
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-heading text-2xl text-gray-400">Level {level}</p>
                            <p className={`font-bold ${inShadow ? 'text-green-400' : 'text-red-400'}`}>
                                {inShadow ? '✓ In Shadow' : '⚠️ IN SUNLIGHT!'}
                            </p>
                        </div>
                    </div>

                    {/* Status Display */}
                    {isPlaying && !isGameOver && (
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div className={`p-3 rounded-lg ${heat > 70 ? 'bg-red-900/50 animate-pulse' : 'bg-orange-900/30'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-orange-400 font-bold">🔥 Heat</span>
                                    <span className={`font-bold ${heat > 70 ? 'text-red-400' : 'text-orange-400'}`}>{heat}%</span>
                                </div>
                                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${heat > 70 ? 'bg-red-500' : heat > 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                                        style={{ width: `${heat}%` }}
                                    />
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-900/30">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-purple-400 font-bold">🛡️ Shield</span>
                                    <span className={`font-bold ${shieldPower < 20 ? 'text-red-400' : 'text-purple-400'}`}>{shieldPower}%</span>
                                </div>
                                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 transition-all"
                                        style={{ width: `${shieldPower}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Game Container */}
                    <PlanetGuard planetId="mercury">
                        <div
                            className="game-canvas-container relative cursor-pointer touch-none select-none"
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
                                <div className="absolute inset-0 bg-gradient-to-b from-orange-950/95 to-gray-950/95 flex flex-col items-center justify-center p-4 text-center z-10 overflow-hidden">
                                    {/* Epic title */}
                                    <div className="relative mb-2">
                                        <h2 className="font-heading text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-orange-400 to-yellow-400 tracking-wider">
                                            SUN CHASER
                                        </h2>
                                        <p className="text-orange-300 text-lg">Outrun the Deadly Sunrise</p>
                                    </div>

                                    {/* Game concept visual - Compact */}
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-500/30">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">☀️</span>
                                                <span className="text-xl">→</span>
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 relative">
                                                    <div className="absolute inset-0 bg-black/60 rounded-full" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}></div>
                                                </div>
                                                <span className="text-xl">→</span>
                                                <span className="text-3xl">🏃</span>
                                            </div>
                                        </div>
                                        <p className="text-text-dim text-xs max-w-xs text-left">
                                            -180°C in shadow, 430°C in sunlight!<br />
                                            Stay in the shadow zone to survive!
                                        </p>
                                    </div>

                                    {/* Controls - SIMPLIFIED! */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="px-6 py-3 bg-yellow-500/20 rounded-lg text-center border border-yellow-500/30">
                                            <span className="text-yellow-400 font-bold text-xl">
                                                <span className="hidden md:inline">HOLD SPACE</span>
                                                <span className="md:hidden">TAP</span>
                                            </span>
                                            <p className="text-xs text-yellow-300">Speed Boost!</p>
                                        </div>
                                        <div className="text-text-dim text-xs text-left max-w-xs">
                                            <p className="text-green-400">🛡️ Shield = AUTO</p>
                                            <p className="text-gray-400">Recharges in shadow</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="group relative px-10 py-4 text-lg font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-orange-600 to-yellow-600 animate-gradient-x"></div>
                                        <div className="absolute inset-0.5 bg-space-deep rounded-xl"></div>
                                        <span className="relative text-white flex items-center gap-3">
                                            <span className="text-xl">☀️</span>
                                            <span>START RUNNING</span>
                                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Trivia Overlay */}
                            {showTrivia && triviaQuestion && (
                                <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center p-8 text-center z-20 backdrop-blur-sm">
                                    <div className="text-4xl mb-4">☀️</div>
                                    <h3 className="font-heading text-2xl text-orange-400 mb-2">SOLAR BREAK!</h3>
                                    <p className="text-text-dim mb-4">Answer correctly for +15⭐, shield recharge, and cooling!</p>
                                    <p className="text-white text-xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                    {!triviaAnswered ? (
                                        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                            {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleTriviaAnswer(idx)}
                                                    className="p-4 bg-gray-800/50 hover:bg-gray-700/60 border border-orange-400/30 rounded-xl text-white transition-all hover:scale-105 hover:border-orange-400/50"
                                                >
                                                    {answer}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="max-w-lg">
                                            <p className={`text-3xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {triviaCorrect ? '✅ CORRECT! +15⭐ +🛡️ +❄️' : '❌ WRONG!'}
                                            </p>
                                            <p className="text-orange-200 text-sm bg-gray-900/50 p-4 rounded-lg">
                                                💡 {triviaQuestion.fact}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Game Over */}
                            {isGameOver && (
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10 backdrop-blur-sm">
                                    <div className="text-6xl mb-4">🔥</div>
                                    <h2 className="font-heading text-5xl text-red-400 mb-2">
                                        OVERHEATED!
                                    </h2>
                                    <p className="text-orange-300 mb-6 text-lg">
                                        The Sun caught up with you...
                                    </p>

                                    <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-gray-500/30">
                                            <p className="text-4xl font-bold text-white">{timeAlive}s</p>
                                            <p className="text-text-dim text-sm">Survived</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-yellow-500/30">
                                            <p className="text-4xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                            <p className="text-text-dim text-sm">Stardust</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-orange-500/30">
                                            <p className="text-4xl font-bold text-orange-400">{score.toLocaleString()}</p>
                                            <p className="text-text-dim text-sm">Score</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-orange-600 hover:from-gray-500 hover:to-orange-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                        >
                                            🔄 TRY AGAIN
                                        </button>
                                        <Link href="/" className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                                            Return to Hub
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </PlanetGuard>
                    {/* Educational Content */}
                    <section className="mt-8 space-y-12">

                        <article className="planet-card bg-gradient-to-br from-gray-900/50 to-orange-900/20">
                            <h2 className="font-heading text-3xl text-gray-400 mb-6">
                                Mercury: The Swift Messenger
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    Mercury is the smallest planet and closest to the Sun. It races around
                                    the Sun in just 88 Earth days - the fastest orbit in our solar system!
                                    Despite being closest to the Sun, it&apos;s not the hottest (that&apos;s Venus)
                                    because it has no atmosphere to trap heat.
                                </p>

                                <div className="bg-orange-900/30 p-6 rounded-lg border-l-4 border-orange-500 my-8">
                                    <p className="font-ui text-orange-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        In &quot;Sun Chaser,&quot; you&apos;re racing around Mercury&apos;s surface,
                                        staying in the shadow zone to avoid the extreme heat. The game simulates
                                        Mercury&apos;s real temperature extremes: -180°C in shadow to 430°C in
                                        direct sunlight! The Sun&apos;s rotation catches up to you over time,
                                        making survival increasingly difficult.
                                    </p>
                                </div>
                            </div>
                        </article>

                        {/* Temperature Comparison */}
                        <div className="planet-card">
                            <h3 className="font-heading text-2xl text-orange-400 mb-6">🌡️ Mercury&apos;s Extreme Temperatures</h3>
                            <div className="flex justify-between items-end h-48 bg-gradient-to-r from-blue-900/30 via-gray-900/30 to-red-900/30 rounded-xl p-4 relative">
                                <div className="text-center">
                                    <div className="h-32 w-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"></div>
                                    <p className="text-blue-400 font-bold mt-2">-180°C</p>
                                    <p className="text-text-dim text-xs">Shadow</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-8 w-12 bg-gray-500 rounded-t-lg"></div>
                                    <p className="text-gray-400 font-bold mt-2">0°C</p>
                                    <p className="text-text-dim text-xs">Freezing</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-24 w-12 bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg"></div>
                                    <p className="text-red-400 font-bold mt-2">+430°C</p>
                                    <p className="text-text-dim text-xs">Sunlight</p>
                                </div>
                                <div className="absolute top-2 right-2 text-xs text-text-dim">
                                    610°C temperature swing!
                                </div>
                            </div>
                        </div>

                        {/* Quick Facts */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-gray-400 mb-4">📊 Mercury Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbital Period</span>
                                        <span className="text-orange-400">88 Earth days</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Day Length</span>
                                        <span className="text-orange-400">59 Earth days</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Size</span>
                                        <span className="text-gray-400">Smallest planet</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Moons</span>
                                        <span className="text-gray-400">None</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Core</span>
                                        <span className="text-orange-400">85% iron!</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card bg-gradient-to-br from-orange-900/20 to-yellow-900/20">
                                <h3 className="font-heading text-xl text-yellow-400 mb-4">☀️ Closest to the Sun</h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    Mercury orbits just 58 million km from the Sun - about 1/3 the distance
                                    from Earth. The Sun appears 3 times larger in Mercury&apos;s sky!
                                </p>
                                <ul className="text-sm text-text-dim space-y-2">
                                    <li>• No atmosphere (solar wind strips it away)</li>
                                    <li>• Covered in impact craters</li>
                                    <li>• Has a weak magnetic field</li>
                                    <li>• Only visited by 2 spacecraft (Mariner 10, MESSENGER)</li>
                                </ul>
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

