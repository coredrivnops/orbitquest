'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { MoonGameLogic } from '@/games/moon/MoonGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function MoonGamePage() {
    const gameLogicRef = useRef<MoonGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [landings, setLandings] = useState(0);
    const [, setFuel] = useState(100);
    const [isLanded, setIsLanded] = useState(false);
    const [isCrashed, setIsCrashed] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new MoonGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    // Handle keyboard input
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const game = gameLogicRef.current;
        if (!game) return;

        // Continue after landing/crash
        if ((game.isLanded || game.isCrashed) && (e.key === ' ' || e.key === 'Space')) {
            e.preventDefault();
            if (game.isLanded) {
                game.nextLevel();
                setIsLanded(false);
            } else if (game.isCrashed) {
                setIsPlaying(false);
                setIsCrashed(false);
                // Save progress
                handleGameEnd(game.score, game.stardustCollected);
            }
            return;
        }

        if (!isPlaying) return;

        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            game.handleInput('thrust-start');
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            game.handleInput('left-start');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            game.handleInput('right-start');
        }
    }, [isPlaying]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
            game.handleInput('thrust-stop');
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            game.handleInput('left-stop');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            game.handleInput('right-stop');
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
            setLevel(game.level);
            setLandings(game.successfulLandings);
            setFuel(game.fuel);
            setIsLanded(game.isLanded);
            setIsCrashed(game.isCrashed);
            setEarnedStardust(game.stardustCollected);

            // Check for trivia trigger
            if (game.showTrivia && !showTrivia && game.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(game.currentTrivia);
                setTriviaAnswered(false);
            }
        }
    };

    const handleGameEnd = (finalScore: number, stardust: number) => {
        addStardust(stardust);
        updateHighScore('moon', finalScore);
        markGamePlayed('moon');

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

    const handleCanvasClick = () => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (game.isLanded) {
            game.nextLevel();
            setIsLanded(false);
        } else if (game.isCrashed) {
            setIsPlaying(false);
            setIsCrashed(false);
            handleGameEnd(game.score, game.stardustCollected);
        }
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.fullReset();
        }
        setIsPlaying(true);
        setIsLanded(false);
        setIsCrashed(false);
        setShowTrivia(false);
        setScore(0);
        setLevel(1);
        setLandings(0);
        setFuel(100);
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
                                <h1 className="font-heading text-3xl text-gray-300">Moon: Lunar Lander</h1>
                                <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm rounded-full font-bold">HIDDEN</span>
                            </div>
                            <p className="text-text-secondary font-ui">
                                Land the module safely on the green landing pads!
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-heading text-2xl text-gray-300">Level {level}</p>
                            <p className="text-green-400">🛬 {landings} landings</p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <PlanetGuard planetId="moon">
                        <div
                            className="game-canvas-container relative cursor-pointer touch-none select-none"
                            onClick={handleCanvasClick}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* Mobile Controls */}
                            {isPlaying && !isCrashed && !isLanded && (
                                <>
                                    <div className="absolute bottom-8 left-8 flex gap-4 z-20 md:hidden">
                                        <button
                                            onTouchStart={(e) => { e.preventDefault(); gameLogicRef.current?.handleInput('left-start'); }}
                                            onTouchEnd={(e) => { e.preventDefault(); gameLogicRef.current?.handleInput('left-stop'); }}
                                            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl select-none active:bg-white/40 backdrop-blur-sm border border-white/30"
                                        >
                                            ⬅️
                                        </button>
                                        <button
                                            onTouchStart={(e) => { e.preventDefault(); gameLogicRef.current?.handleInput('right-start'); }}
                                            onTouchEnd={(e) => { e.preventDefault(); gameLogicRef.current?.handleInput('right-stop'); }}
                                            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl select-none active:bg-white/40 backdrop-blur-sm border border-white/30"
                                        >
                                            ➡️
                                        </button>
                                    </div>

                                    <div className="absolute bottom-8 right-8 z-20 md:hidden">
                                        <button
                                            onTouchStart={(e) => { e.preventDefault(); gameLogicRef.current?.handleInput('thrust-start'); }}
                                            onTouchEnd={(e) => { e.preventDefault(); gameLogicRef.current?.handleInput('thrust-stop'); }}
                                            className="w-20 h-20 bg-red-500/30 rounded-full flex items-center justify-center text-4xl select-none active:bg-red-500/50 border-2 border-red-400 backdrop-blur-sm"
                                        >
                                            🔥
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Start Overlay */}
                            {!isPlaying && !isCrashed && (
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center z-10 overflow-hidden">
                                    {/* Epic title */}
                                    <div className="relative mb-2">
                                        <h2 className="font-heading text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-300 tracking-wider">
                                            LUNAR LANDER
                                        </h2>
                                        <p className="text-gray-400 text-lg">A Retro Arcade Classic</p>
                                    </div>

                                    <p className="text-text-dim text-xs mb-3 max-w-sm">
                                        Land safely on the Moon - just like the Apollo astronauts!
                                    </p>

                                    {/* Controls - Compact */}
                                    <div className="flex gap-2 mb-3">
                                        <div className="p-2 bg-white/10 rounded-lg text-center">
                                            <p className="text-xl">⬅️</p>
                                            <p className="text-white text-xs font-bold">← / A</p>
                                        </div>
                                        <div className="p-2 bg-white/10 rounded-lg text-center">
                                            <p className="text-xl">🔥</p>
                                            <p className="text-white text-xs font-bold">↑ / SPACE</p>
                                        </div>
                                        <div className="p-2 bg-white/10 rounded-lg text-center">
                                            <p className="text-xl">➡️</p>
                                            <p className="text-white text-xs font-bold">→ / D</p>
                                        </div>
                                    </div>

                                    {/* Landing tips - Super compact */}
                                    <div className="flex gap-3 mb-4 text-xs">
                                        <div className="px-3 py-2 bg-green-900/30 rounded-lg border border-green-500/20">
                                            <p className="text-green-400 font-bold">✓ Safe</p>
                                            <p className="text-text-dim">Green pad • Slow • Upright</p>
                                        </div>
                                        <div className="px-3 py-2 bg-red-900/30 rounded-lg border border-red-500/20">
                                            <p className="text-red-400 font-bold">✗ Crash</p>
                                            <p className="text-text-dim">Too fast • Tilted • Miss pad</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="group relative px-10 py-4 text-lg font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-gradient-x"></div>
                                        <div className="absolute inset-0.5 bg-space-deep rounded-xl"></div>
                                        <span className="relative text-white flex items-center gap-3">
                                            <span className="text-xl">🚀</span>
                                            <span>BEGIN DESCENT</span>
                                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Game Over Overlay (after crash + click) */}
                            {!isPlaying && isCrashed && (
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10 backdrop-blur-sm">
                                    <div className="text-6xl mb-4">💥</div>
                                    <h2 className="font-heading text-5xl text-red-400 mb-2">
                                        MISSION FAILED
                                    </h2>
                                    <p className="text-gray-300 mb-6 italic text-lg">
                                        The lander didn&apos;t survive the impact...
                                    </p>

                                    <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-gray-500/30">
                                            <p className="text-4xl font-bold text-white">{landings}</p>
                                            <p className="text-text-dim text-sm">Landings</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-yellow-500/30">
                                            <p className="text-4xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                            <p className="text-text-dim text-sm">Stardust</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-gray-500/30">
                                            <p className="text-4xl font-bold text-gray-300">{score.toLocaleString()}</p>
                                            <p className="text-text-dim text-sm">Score</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                        >
                                            🔄 TRY AGAIN
                                        </button>
                                        <Link href="/" className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                                            Return to Hub
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Trivia Overlay */}
                            {showTrivia && triviaQuestion && (
                                <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center p-8 text-center z-20 backdrop-blur-sm">
                                    <div className="text-4xl mb-4">🌙</div>
                                    <h3 className="font-heading text-2xl text-gray-300 mb-2">APOLLO QUIZ!</h3>
                                    <p className="text-text-dim mb-4">Answer correctly for +15⭐ and +30 fuel!</p>
                                    <p className="text-white text-xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                    {!triviaAnswered ? (
                                        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                            {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleTriviaAnswer(idx)}
                                                    className="p-4 bg-gray-800/50 hover:bg-gray-700/60 border border-gray-400/30 rounded-xl text-white transition-all hover:scale-105 hover:border-gray-400/50"
                                                >
                                                    {answer}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="max-w-lg">
                                            <p className={`text-3xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {triviaCorrect ? '✅ CORRECT! +15⭐ +⛽' : '❌ WRONG!'}
                                            </p>
                                            <p className="text-gray-200 text-sm bg-gray-900/50 p-4 rounded-lg">
                                                💡 {triviaQuestion.fact}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </PlanetGuard>
                    {/* Educational Content */}
                    <section className="mt-8 space-y-12">

                        <article className="planet-card bg-gradient-to-br from-gray-900/50 to-gray-800/30">
                            <h2 className="font-heading text-3xl text-gray-300 mb-6">
                                The Moon: Our Nearest Neighbor
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    The Moon is humanity&apos;s first destination beyond Earth. Between 1969 and 1972,
                                    twelve astronauts walked on its dusty surface during the Apollo program.
                                    Now, with NASA&apos;s Artemis program, we&apos;re going back!
                                </p>

                                <div className="bg-gray-800/50 p-6 rounded-lg border-l-4 border-gray-400 my-8">
                                    <p className="font-ui text-gray-300 font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        Lunar Lander recreates the challenge Apollo astronauts faced! With
                                        only 1/6th of Earth&apos;s gravity, the Moon requires careful fuel
                                        management and precise control to land safely. The game gets harder
                                        as gravity increases and landing pads get smaller!
                                    </p>
                                </div>
                            </div>
                        </article>

                        {/* Apollo Missions */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="planet-card text-center">
                                <div className="text-4xl mb-3">🚀</div>
                                <h3 className="font-heading text-lg text-gray-300 mb-1">Apollo 11</h3>
                                <p className="text-text-dim text-sm">First Moon landing</p>
                                <p className="text-gray-500 text-xs">July 20, 1969</p>
                            </div>
                            <div className="planet-card text-center">
                                <div className="text-4xl mb-3">👨‍🚀</div>
                                <h3 className="font-heading text-lg text-gray-300 mb-1">12 Moonwalkers</h3>
                                <p className="text-text-dim text-sm">Humans on the Moon</p>
                                <p className="text-gray-500 text-xs">1969-1972</p>
                            </div>
                            <div className="planet-card text-center">
                                <div className="text-4xl mb-3">🌓</div>
                                <h3 className="font-heading text-lg text-gray-300 mb-1">238,855 mi</h3>
                                <p className="text-text-dim text-sm">Distance from Earth</p>
                                <p className="text-gray-500 text-xs">~1.3 light seconds</p>
                            </div>
                            <div className="planet-card text-center">
                                <div className="text-4xl mb-3">🏳️</div>
                                <h3 className="font-heading text-lg text-gray-300 mb-1">Artemis</h3>
                                <p className="text-text-dim text-sm">We&apos;re going back!</p>
                                <p className="text-gray-500 text-xs">2020s</p>
                            </div>
                        </div>

                        {/* Quick Facts */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-gray-300 mb-4">📊 Moon Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Diameter</span>
                                        <span className="text-gray-400">3,474 km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Gravity</span>
                                        <span className="text-gray-400">1/6th of Earth</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbit Period</span>
                                        <span className="text-gray-400">27.3 days</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Temperature</span>
                                        <span className="text-gray-400">-173°C to 127°C</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Atmosphere</span>
                                        <span className="text-yellow-400">None (vacuum)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card bg-gradient-to-br from-gray-800/30 to-gray-900/30">
                                <h3 className="font-heading text-xl text-gray-400 mb-4">👣 Eternal Footprints</h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    On the Moon, footprints last millions of years. With no wind,
                                    rain, or erosion, the marks left by Apollo astronauts are still
                                    there today, exactly as they left them!
                                </p>
                                <p className="text-text-dim text-sm italic">
                                    &quot;That&apos;s one small step for man, one giant leap for mankind.&quot;
                                    <br />— Neil Armstrong, 1969
                                </p>
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

