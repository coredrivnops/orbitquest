'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { MarsGameLogic } from '@/games/mars/MarsGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function MarsGamePage() {
    const gameLogicRef = useRef<MarsGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [samples, setSamples] = useState(0);
    const [lives, setLives] = useState(3);
    const [combo, setCombo] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new MarsGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    // Handle keyboard input
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            game.handleInput('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            game.handleInput('right');
        }
    }, [isPlaying]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            game.handleInput('stop-left');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            game.handleInput('stop-right');
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
            setSamples(game.samplesCollected);
            setLives(game.lives);
            setCombo(game.combo);

            // Check for trivia trigger
            if (game.showTrivia && !showTrivia && game.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(game.currentTrivia);
                setTriviaAnswered(false);
            }

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.stardustCollected, game.samplesCollected);
            }
        }
    };

    const handleGameOver = (finalScore: number, stardust: number, finalSamples: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setSamples(finalSamples);

        addStardust(stardust);
        updateHighScore('mars', finalScore);
        markGamePlayed('mars');

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

    // Touch/Mouse controls
    const handleMouseMove = (e: React.MouseEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const x = (e.clientX - rect.left) * scaleX;

        game.setTargetX(x);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 0) return;
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const x = (e.touches[0].clientX - rect.left) * scaleX;

        game.setTargetX(x);
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setShowTrivia(false);
        setScore(0);
        setSamples(0);
        setLives(3);
        setCombo(1);
        setEarnedStardust(0);
    };

    return (
        <PlanetGuard planetId="mars">
            <>
                <Header />

                <main className="flex-1 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Game Header */}
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="font-heading text-3xl text-red-400">Mars: Rover Rush</h1>
                                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full font-bold">1200⭐</span>
                                </div>
                                <p className="text-text-secondary font-ui">
                                    Drive the Perseverance rover! Collect samples with ← → or A/D
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-heading text-2xl text-red-400">{samples} samples</p>
                                {combo > 1 && (
                                    <p className="text-yellow-400 font-bold">x{combo.toFixed(1)} Combo!</p>
                                )}
                            </div>
                        </div>

                        {/* Game Container */}
                        <div
                            className="game-canvas-container relative cursor-none touch-none select-none"
                            onMouseMove={handleMouseMove}
                            onTouchMove={handleTouchMove}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* Start Overlay */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10">
                                    {/* Epic title */}
                                    <div className="relative mb-4">
                                        <h2 className="font-heading text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-400 tracking-wider">
                                            ROVER RUSH
                                        </h2>
                                        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 blur-xl -z-10" />
                                    </div>

                                    <p className="text-red-300 text-xl mb-2">Explore the Red Planet!</p>
                                    <p className="text-text-dim text-sm mb-8 max-w-md">
                                        Drive the Perseverance rover and collect Martian samples
                                    </p>

                                    {/* Controls */}
                                    <div className="max-w-md mb-8">
                                        <div className="bg-gradient-to-br from-red-900/40 to-orange-900/30 rounded-xl border border-red-500/30 p-6 mb-6">
                                            <p className="text-red-400 font-bold text-xl mb-4">🎮 CONTROLS</p>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="p-3 bg-white/10 rounded-lg">
                                                    <p className="text-3xl mb-1">⬅️</p>
                                                    <p className="text-white font-bold">← or A</p>
                                                    <p className="text-text-dim text-xs">Move Left</p>
                                                </div>
                                                <div className="p-3 bg-white/10 rounded-lg">
                                                    <p className="text-3xl mb-1">➡️</p>
                                                    <p className="text-white font-bold">→ or D</p>
                                                    <p className="text-text-dim text-xs">Move Right</p>
                                                </div>
                                            </div>
                                            <p className="text-text-dim text-sm mt-4">Or move your mouse/finger to control!</p>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                                            <div className="p-2 bg-amber-900/30 rounded-lg">
                                                <p className="text-xl">🪨</p>
                                                <p className="text-amber-400">Sample</p>
                                            </div>
                                            <div className="p-2 bg-purple-900/30 rounded-lg">
                                                <p className="text-xl">💎</p>
                                                <p className="text-purple-400">Crystal 3x</p>
                                            </div>
                                            <div className="p-2 bg-blue-900/30 rounded-lg">
                                                <p className="text-xl">🧊</p>
                                                <p className="text-blue-400">Ice 2x</p>
                                            </div>
                                            <div className="p-2 bg-red-900/30 rounded-lg">
                                                <p className="text-xl">☄️</p>
                                                <p className="text-red-400">AVOID!</p>
                                            </div>
                                        </div>

                                        <p className="text-text-dim text-sm">Collect samples, avoid meteors. 3 lives!</p>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="group relative px-12 py-5 text-xl font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 animate-gradient-x"></div>
                                        <div className="absolute inset-0.5 bg-space-deep rounded-xl"></div>
                                        <span className="relative text-white flex items-center gap-3">
                                            <span className="text-2xl">🤖</span>
                                            <span>START COLLECTING</span>
                                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Trivia Overlay */}
                            {showTrivia && triviaQuestion && (
                                <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center p-8 text-center z-20 backdrop-blur-sm">
                                    <div className="text-4xl mb-4">🔴</div>
                                    <h3 className="font-heading text-2xl text-red-400 mb-2">SAMPLE ANALYSIS!</h3>
                                    <p className="text-text-dim mb-4">Answer correctly for +10⭐ and +1 life!</p>
                                    <p className="text-white text-xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                    {!triviaAnswered ? (
                                        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                            {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleTriviaAnswer(idx)}
                                                    className="p-4 bg-red-800/50 hover:bg-red-700/60 border border-red-400/30 rounded-xl text-white transition-all hover:scale-105 hover:border-red-400/50"
                                                >
                                                    {answer}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="max-w-lg">
                                            <p className={`text-3xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {triviaCorrect ? '✅ CORRECT! +10⭐ +1❤️' : '❌ WRONG!'}
                                            </p>
                                            <p className="text-red-200 text-sm bg-red-900/50 p-4 rounded-lg">
                                                💡 {triviaQuestion.fact}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Game Over */}
                            {isGameOver && (
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10 backdrop-blur-sm">
                                    <div className="text-6xl mb-4">💥</div>
                                    <h2 className="font-heading text-5xl text-red-400 mb-2">
                                        MISSION OVER
                                    </h2>
                                    <p className="text-orange-300 mb-6 italic text-lg">
                                        The rover took too much damage...
                                    </p>

                                    <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-red-500/30">
                                            <p className="text-4xl font-bold text-white">{samples}</p>
                                            <p className="text-text-dim text-sm">Samples</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-yellow-500/30">
                                            <p className="text-4xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                            <p className="text-text-dim text-sm">Stardust</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-red-500/30">
                                            <p className="text-4xl font-bold text-red-400">{score.toLocaleString()}</p>
                                            <p className="text-text-dim text-sm">Score</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
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
                        {/* Educational Content */}
                        <section className="mt-8 space-y-12">

                            <article className="planet-card bg-gradient-to-br from-red-900/30 to-orange-900/20">
                                <h2 className="font-heading text-3xl text-red-400 mb-6">
                                    Mars: The Next Frontier
                                </h2>
                                <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                    <p className="text-lg">
                                        Mars is humanity&apos;s next destination! The Red Planet has fascinated us
                                        for centuries, and now we have rovers actively exploring its surface.
                                        Perseverance, which landed in 2021, is collecting samples that will
                                        eventually be returned to Earth for analysis.
                                    </p>

                                    <div className="bg-red-900/30 p-6 rounded-lg border-l-4 border-red-500 my-8">
                                        <p className="font-ui text-red-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                        <p>
                                            In Rover Rush, you&apos;re piloting the Perseverance rover across the
                                            Martian surface! The rock samples, ice, and crystals represent real
                                            materials scientists hope to study. Dust storms are a real hazard
                                            that rovers must survive - Opportunity was killed by a global dust
                                            storm in 2018!
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {/* Quick Facts */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="planet-card">
                                    <h3 className="font-heading text-xl text-red-400 mb-4">📊 Mars Facts</h3>
                                    <ul className="space-y-3 text-sm text-text-secondary">
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Size</span>
                                            <span className="text-red-400">Half of Earth</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Day Length</span>
                                            <span className="text-red-400">24h 37min</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Moons</span>
                                            <span className="text-red-400">Phobos & Deimos</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Tallest Mountain</span>
                                            <span className="text-red-400">Olympus Mons (22km)</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Active Rovers</span>
                                            <span className="text-green-400">Curiosity & Perseverance</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="planet-card bg-gradient-to-br from-amber-900/20 to-red-900/20">
                                    <h3 className="font-heading text-xl text-amber-400 mb-4">🤖 Perseverance Rover</h3>
                                    <p className="text-text-secondary text-sm mb-4">
                                        NASA&apos;s most advanced Mars rover, searching for signs of ancient
                                        microbial life and collecting samples for future return to Earth.
                                    </p>
                                    <ul className="text-sm text-text-dim space-y-2">
                                        <li>• Landed February 18, 2021</li>
                                        <li>• Carries Ingenuity helicopter</li>
                                        <li>• Collecting samples in tubes</li>
                                        <li>• Exploring Jezero Crater</li>
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
        </PlanetGuard>
    );
}

