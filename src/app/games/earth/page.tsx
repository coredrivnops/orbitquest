'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import { EarthGameLogic } from '@/games/earth/EarthGameLogic';
import { addStardust, updateHighScore } from '@/lib/localStorage';
import Link from 'next/link';

export default function EarthGamePage() {
    const gameLogicRef = useRef<EarthGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [isHolding, setIsHolding] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new EarthGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying) {
            // Pass holding state to game
            game.handleInput(0, 0, isHolding);
            game.update();
        }
        game.draw(ctx);

        if (frameCount % 10 === 0) {
            setScore(game.score);

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.stardustCollected);
            }
        }
    };

    const handleGameOver = (finalScore: number, stardust: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setIsHolding(false);

        addStardust(stardust);
        updateHighScore('earth', finalScore);

        window.dispatchEvent(new CustomEvent('stardust-earned', {
            detail: { amount: stardust }
        }));
    };

    const handlePointerDown = () => {
        if (isPlaying && !isGameOver) {
            setIsHolding(true);
        }
    };

    const handlePointerUp = () => {
        setIsHolding(false);
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setScore(0);
        setEarnedStardust(0);
    };

    // FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is orbital mechanics?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Orbital mechanics is the study of how objects move in space under the influence of gravity. Satellites must maintain the right balance between speed and altitude to stay in a stable orbit around Earth."
                }
            },
            {
                "@type": "Question",
                "name": "Why do satellites fall back to Earth?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Low Earth orbit satellites experience slight atmospheric drag even at 400km altitude. Without periodic boosts, they slowly lose altitude and eventually re-enter the atmosphere."
                }
            },
            {
                "@type": "Question",
                "name": "What is the ISS orbital altitude?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The International Space Station orbits at approximately 400km (250 miles) above Earth, completing one orbit every 90 minutes at a speed of 28,000 km/h."
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <Header />

            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Game Header */}
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="font-heading text-3xl text-neon-cyan">Earth: Orbital Balance</h1>
                            <p className="text-text-secondary font-ui">
                                Maintain stable orbit. Balance thrust against gravity.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-text-dim text-sm uppercase tracking-wider">Score</p>
                            <p className="font-heading text-2xl text-neon-purple">{score.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <div
                        className="game-canvas-container relative touch-none select-none"
                        onMouseDown={handlePointerDown}
                        onMouseUp={handlePointerUp}
                        onMouseLeave={handlePointerUp}
                        onTouchStart={handlePointerDown}
                        onTouchEnd={handlePointerUp}
                    >
                        <GameCanvas
                            onGameLoop={handleGameLoop}
                            width={1280}
                            height={720}
                        />

                        {/* Start Overlay */}
                        {!isPlaying && !isGameOver && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center z-10">
                                <h2 className="font-heading text-4xl text-neon-cyan mb-4 glow-text">
                                    Orbital Balance
                                </h2>
                                <div className="max-w-lg mb-8 space-y-4">
                                    <p className="text-text-secondary text-lg">
                                        You are a satellite orbiting Earth. Gravity constantly pulls you down.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="p-3 bg-white/5 rounded">
                                            <p className="text-neon-cyan font-bold">HOLD</p>
                                            <p className="text-text-dim">Click/Tap to boost altitude</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded">
                                            <p className="text-neon-cyan font-bold">RELEASE</p>
                                            <p className="text-text-dim">Let gravity lower orbit</p>
                                        </div>
                                    </div>
                                    <p className="text-yellow-400">
                                        Stay in the <span className="text-green-400">green zone</span> for bonus points!
                                    </p>
                                </div>
                                <button
                                    onClick={startGame}
                                    className="btn-neon text-xl px-12 py-4 animate-pulse-glow"
                                >
                                    Launch Satellite
                                </button>
                            </div>
                        )}

                        {/* Game Over */}
                        {isGameOver && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center z-10">
                                <h2 className="font-heading text-4xl text-red-400 mb-4">
                                    Mission Failed
                                </h2>
                                <p className="text-2xl text-white mb-2">Score: {score.toLocaleString()}</p>
                                <p className="text-xl text-yellow-400 mb-8">+{earnedStardust} Stardust</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={startGame}
                                        className="btn-neon px-8 py-3"
                                    >
                                        Relaunch
                                    </button>
                                    <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
                                        Return to Hub
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Educational Content */}
                    <section className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="planet-card">
                                <h2 className="font-heading text-2xl text-neon-cyan mb-4">
                                    The Science of Staying in Orbit
                                </h2>
                                <div className="prose prose-invert max-w-none text-text-secondary">
                                    <p>
                                        Orbiting isn't about escaping gravity—it's about falling around the Earth.
                                        A satellite in orbit is constantly falling toward Earth, but moving sideways
                                        fast enough that it keeps missing the ground.
                                    </p>
                                    <p>
                                        At the International Space Station's altitude of 400km, orbital velocity is
                                        about 7.66 km/s (27,576 km/h). At this speed, astronauts experience 16 sunrises
                                        and sunsets every day!
                                    </p>
                                    <h3 className="text-neon-purple font-heading mt-6 mb-2">Kepler's Laws</h3>
                                    <p>
                                        Johannes Kepler discovered that objects in lower orbits move faster than those
                                        in higher orbits. This is why your satellite speeds up as it falls and slows
                                        down as you boost to higher altitudes—just like real orbital mechanics!
                                    </p>
                                    <div className="bg-space-dark p-4 rounded-lg border-l-4 border-blue-400 my-6">
                                        <p className="font-ui text-blue-400 font-bold mb-1">REAL PHYSICS</p>
                                        <p className="text-sm">
                                            This game uses simplified but scientifically accurate orbital physics.
                                            The ISS regularly fires its thrusters to maintain altitude, just like
                                            you do in this game!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-lg text-neon-purple mb-4">
                                    Earth Orbit Facts
                                </h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>ISS Altitude</span>
                                        <span className="text-neon-cyan">~400 km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbital Velocity</span>
                                        <span className="text-neon-cyan">27,576 km/h</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbit Period</span>
                                        <span className="text-neon-cyan">90 minutes</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Active Satellites</span>
                                        <span className="text-neon-cyan">~7,000</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card bg-gradient-to-br from-space-tertiary to-blue-900/20">
                                <h3 className="font-heading text-lg text-blue-400 mb-2">
                                    Did You Know?
                                </h3>
                                <p className="text-sm text-text-dim italic">
                                    &quot;The ISS loses about 2km of altitude per month due to atmospheric drag.
                                    Visiting spacecraft and onboard thrusters periodically boost it back up.&quot;
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            <Footer />
        </>
    );
}
