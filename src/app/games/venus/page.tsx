'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { VenusGameLogic } from '@/games/venus/VenusGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function VenusGamePage() {
    const gameLogicRef = useRef<VenusGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [depth, setDepth] = useState(0);
    const [hullIntegrity, setHullIntegrity] = useState(100);
    const [temperature, setTemperature] = useState(0);
    const [dataProbes, setDataProbes] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [currentLayer, setCurrentLayer] = useState('Upper Clouds');

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new VenusGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    // Handle mouse movement for horizontal control
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying || showTrivia) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 1280;
        const y = ((e.clientY - rect.top) / rect.height) * 720;
        game.handleInput(x, y);
    }, [isPlaying, showTrivia]);

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying) {
            game.update();
        }
        game.draw(ctx);

        if (frameCount % 6 === 0) {
            setScore(game.score);
            setDepth(Math.floor(game.depth / 1000 * 10) / 10);
            setHullIntegrity(Math.floor(game.hullIntegrity));
            setTemperature(Math.floor(game.temperature));
            setDataProbes(game.dataProbesCollected);
            setEarnedStardust(game.stardustCollected);

            // Get current layer name
            const layers = ['Upper Clouds (50km)', 'Middle Clouds (45km)', 'Lower Clouds (35km)', 'Deep Atmosphere (20km)'];
            setCurrentLayer(layers[game.currentLayer] || 'Upper Clouds');

            // Check for trivia trigger
            if (game.showTrivia && !showTrivia && game.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(game.currentTrivia);
                setTriviaAnswered(false);
            }

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.stardustCollected, game.depth);
            }
        }
    };

    const handleGameOver = (finalScore: number, stardust: number, finalDepth: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setDepth(Math.floor(finalDepth / 1000 * 10) / 10);

        addStardust(stardust);
        updateHighScore('venus', finalScore);
        markGamePlayed('venus');

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
        setDepth(0);
        setHullIntegrity(100);
        setTemperature(0);
        setDataProbes(0);
        setEarnedStardust(0);
    };

    return (
        <PlanetGuard planetId="venus">
            <>
                <Header />

                <main className="flex-1 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Game Header */}
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="font-heading text-3xl text-orange-400">Venus: Pressure Drop</h1>
                                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full font-bold">150⭐</span>
                                </div>
                                <p className="text-text-secondary font-ui">
                                    Descend through Venus&apos;s crushing atmosphere!
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-heading text-2xl text-orange-400">{depth}km</p>
                                <p className="text-yellow-400">{currentLayer}</p>
                            </div>
                        </div>

                        {/* Status Display */}
                        {isPlaying && !isGameOver && (
                            <div className="mb-4 flex gap-4 items-center justify-between bg-gradient-to-r from-orange-900/30 to-red-900/30 p-3 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-dim">HULL:</span>
                                        <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${hullIntegrity > 50 ? 'bg-green-500' : hullIntegrity > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${hullIntegrity}%` }}
                                            ></div>
                                        </div>
                                        <span className={`font-bold ${hullIntegrity > 50 ? 'text-green-400' : hullIntegrity > 25 ? 'text-yellow-400' : 'text-red-400'}`}>{hullIntegrity}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-dim">🌡️</span>
                                        <div className="w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                                                style={{ width: `${temperature}%` }}
                                            ></div>
                                        </div>
                                        <span className={`font-bold ${temperature < 50 ? 'text-green-400' : temperature < 80 ? 'text-yellow-400' : 'text-red-400'}`}>{temperature}°</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="text-white font-bold text-lg">📡 {dataProbes} Data Probes</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-yellow-400">⭐ {earnedStardust}</span>
                                </div>
                            </div>
                        )}

                        {/* Game Container */}
                        <div
                            className="game-canvas-container relative cursor-pointer touch-none select-none"
                            onMouseMove={handleMouseMove}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* Start Overlay */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow-950/95 to-red-950/95 flex flex-col items-center justify-center p-4 text-center z-10 overflow-hidden">
                                    {/* Epic title */}
                                    <div className="relative mb-4">
                                        <h2 className="font-heading text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 tracking-wider">
                                            PRESSURE DROP
                                        </h2>
                                        <p className="text-orange-300 text-lg">Descend Into Hell</p>
                                    </div>

                                    {/* Venus stats */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-red-900/40 rounded-xl border border-red-500/30 text-center">
                                            <div className="text-2xl font-bold text-red-400">465°C</div>
                                            <p className="text-orange-300 text-xs">Surface Temp</p>
                                        </div>
                                        <div className="p-3 bg-orange-900/40 rounded-xl border border-orange-500/30 text-center">
                                            <div className="text-2xl font-bold text-orange-400">92x</div>
                                            <p className="text-orange-300 text-xs">Earth Pressure</p>
                                        </div>
                                        <div className="p-3 bg-yellow-900/40 rounded-xl border border-yellow-500/30 text-center">
                                            <div className="text-2xl font-bold text-yellow-400">H₂SO₄</div>
                                            <p className="text-orange-300 text-xs">Acid Clouds</p>
                                        </div>
                                    </div>

                                    {/* Game mechanics */}
                                    <div className="bg-orange-900/30 p-4 rounded-xl border border-orange-500/30 mb-6 max-w-lg">
                                        <p className="text-orange-400 font-bold mb-3">🚀 MISSION OBJECTIVES</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🛡️</span>
                                                <span className="text-text-dim">Collect shields to survive</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">❄️</span>
                                                <span className="text-text-dim">Coolant prevents overheating</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">📡</span>
                                                <span className="text-text-dim">Capture data probes</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">☢️</span>
                                                <span className="text-text-dim">Avoid acid clouds</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
                                            <span className="text-2xl">🖱️</span>
                                            <span className="text-white text-sm">Move mouse left/right to dodge</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="group relative px-10 py-4 text-lg font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 animate-gradient-x"></div>
                                        <div className="absolute inset-0.5 bg-space-deep rounded-xl"></div>
                                        <span className="relative text-white flex items-center gap-3">
                                            <span className="text-xl">🔥</span>
                                            <span>BEGIN DESCENT</span>
                                            <span className="group-hover:translate-y-1 transition-transform">↓</span>
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Trivia Overlay */}
                            {showTrivia && triviaQuestion && (
                                <div className="absolute inset-0 bg-orange-950/95 flex flex-col items-center justify-center p-8 text-center z-20 backdrop-blur-sm">
                                    <div className="text-4xl mb-4">🛸</div>
                                    <h3 className="font-heading text-2xl text-yellow-400 mb-2">TRANSMISSION RECEIVED!</h3>
                                    <p className="text-text-dim mb-4">Answer correctly for +20⭐, hull repair, cooling, and shield!</p>
                                    <p className="text-white text-xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                    {!triviaAnswered ? (
                                        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                            {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleTriviaAnswer(idx)}
                                                    className="p-4 bg-orange-800/50 hover:bg-orange-700/60 border border-yellow-400/30 rounded-xl text-white transition-all hover:scale-105 hover:border-yellow-400/50"
                                                >
                                                    {answer}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="max-w-lg">
                                            <p className={`text-3xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {triviaCorrect ? '✅ CORRECT! +20⭐ +🛡️ HULL REPAIRED!' : '❌ WRONG!'}
                                            </p>
                                            <p className="text-orange-200 text-sm bg-orange-900/50 p-4 rounded-lg">
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
                                        HULL BREACH!
                                    </h2>
                                    <p className="text-orange-300 mb-6 text-lg">
                                        Venus&apos;s crushing atmosphere claimed another probe...
                                    </p>

                                    <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-orange-500/30">
                                            <p className="text-4xl font-bold text-orange-400">{depth}km</p>
                                            <p className="text-text-dim text-sm">Depth Reached</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-yellow-500/30">
                                            <p className="text-4xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                            <p className="text-text-dim text-sm">Stardust</p>
                                        </div>
                                        <div className="bg-space-tertiary/50 p-5 rounded-xl border border-green-500/30">
                                            <p className="text-4xl font-bold text-green-400">{dataProbes}📡</p>
                                            <p className="text-text-dim text-sm">Data Probes</p>
                                        </div>
                                    </div>

                                    <p className="text-3xl font-bold text-white mb-6">Score: {score.toLocaleString()}</p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                        >
                                            🔄 DESCEND AGAIN
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

                            <article className="planet-card bg-gradient-to-br from-orange-900/30 to-red-900/20">
                                <h2 className="font-heading text-3xl text-orange-400 mb-6">
                                    🔥 Venus: Earth&apos;s Evil Twin
                                </h2>
                                <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                    <p className="text-lg">
                                        Venus is often called Earth&apos;s twin because of its similar size, but the
                                        similarities end there. Venus has a <strong>runaway greenhouse effect</strong> that
                                        makes it the hottest planet in our solar system - even hotter than Mercury!
                                    </p>

                                    <div className="bg-red-900/30 p-6 rounded-lg border-l-4 border-red-500 my-8">
                                        <p className="font-ui text-red-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                        <p>
                                            In &quot;Pressure Drop,&quot; you&apos;re experiencing what any probe descending into
                                            Venus would face: crushing pressure that increases 92x as you descend,
                                            temperatures hot enough to melt lead, and clouds of sulfuric acid. The
                                            Soviet Venera probes only survived 23-127 minutes on the surface!
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {/* Atmosphere Layers */}
                            <div className="planet-card">
                                <h3 className="font-heading text-2xl text-orange-400 mb-6">🌫️ Venus Atmosphere Layers</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-yellow-200/10">
                                        <div className="w-4 h-4 rounded-full bg-yellow-200"></div>
                                        <div>
                                            <p className="text-yellow-200 font-bold">Upper Clouds (65-70 km)</p>
                                            <p className="text-text-dim text-sm">Lightning storms, sulfuric acid droplets, UV absorption</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-yellow-400/10">
                                        <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                                        <div>
                                            <p className="text-yellow-400 font-bold">Middle Clouds (50-55 km)</p>
                                            <p className="text-text-dim text-sm">Most Earth-like! NASA proposes floating cities here</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-orange-500/10">
                                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                                        <div>
                                            <p className="text-orange-400 font-bold">Lower Clouds (35-45 km)</p>
                                            <p className="text-text-dim text-sm">Dense cloud layer, extreme heat begins</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-red-500/10">
                                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                        <div>
                                            <p className="text-red-400 font-bold">Deep Atmosphere (0-35 km)</p>
                                            <p className="text-text-dim text-sm">Crushing pressure, 465°C surface, volcanic activity</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Facts */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="planet-card">
                                    <h3 className="font-heading text-xl text-orange-400 mb-4">📊 Venus Facts</h3>
                                    <ul className="space-y-3 text-sm text-text-secondary">
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Surface temperature</span>
                                            <span className="text-red-400">465°C (900°F)</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Surface pressure</span>
                                            <span className="text-orange-400">92 atmospheres</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Day length</span>
                                            <span className="text-yellow-400">243 Earth days</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Rotation direction</span>
                                            <span className="text-yellow-400">Retrograde (backwards!)</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Cloud composition</span>
                                            <span className="text-green-400">Sulfuric acid (H₂SO₄)</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="planet-card bg-gradient-to-br from-red-900/20 to-orange-900/20">
                                    <h3 className="font-heading text-xl text-red-400 mb-4">☠️ Why Venus is Deadly</h3>
                                    <p className="text-text-secondary text-sm mb-4">
                                        Any spacecraft landing on Venus faces extreme challenges:
                                    </p>
                                    <ul className="text-sm text-text-dim space-y-2">
                                        <li>• Pressure crushes steel like paper</li>
                                        <li>• Heat melts electronics</li>
                                        <li>• Acid corrodes metal</li>
                                        <li>• Dense atmosphere blocks solar power</li>
                                        <li>• Venera probes survived only 23-127 min</li>
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

