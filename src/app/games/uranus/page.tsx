'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { UranusGameLogic } from '@/games/uranus/UranusGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function UranusGamePage() {
    const gameLogicRef = useRef<UranusGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);

    useEffect(() => {
        gameLogicRef.current = new UranusGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying) {
            game.update();
        }
        game.draw(ctx);

        if (frameCount % 10 === 0) {
            setScore(game.score);
            setLevel(game.level);

            if (game.isGameOver && !isGameOver) {
                handleGameEnd(game.score, game.stardustCollected);
            }
        }
    };

    const handleGameEnd = (finalScore: number, stardust: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);

        addStardust(stardust);
        updateHighScore('uranus', finalScore);
        markGamePlayed('uranus');

        window.dispatchEvent(new CustomEvent('stardust-earned', {
            detail: { amount: stardust }
        }));
    };

    const handleInput = (e: React.MouseEvent | React.TouchEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;

        let clientX, clientY;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        game.handleInput(x, y);
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setIsWin(false);
        setScore(0);
        setLevel(1);
        setEarnedStardust(0);
    };

    // FAQ Schema for SEO
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How long are seasons on Uranus?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Each season on Uranus lasts about 21 Earth years, making a full year on Uranus equal to 84 Earth years. Because of its extreme 98° tilt, one pole faces the Sun for decades while the other is in complete darkness."
                }
            },
            {
                "@type": "Question",
                "name": "Why is Uranus tilted on its side?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Scientists believe Uranus was knocked onto its side by a collision with an Earth-sized object billions of years ago. This extreme 98° axial tilt is unique among the planets in our solar system."
                }
            },
            {
                "@type": "Question",
                "name": "What is Polar Night?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Polar night is when the Sun doesn't rise for more than 24 hours. On Uranus, due to its extreme tilt, the polar night can last for 42 Earth years, with one pole in complete darkness while the other faces the Sun."
                }
            }
        ]
    };

    return (
        <PlanetGuard planetId="uranus">
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
                                <h1 className="font-heading text-3xl" style={{ color: '#22d3ee' }}>Uranus: Polar Night</h1>
                                <p className="text-text-secondary font-ui">
                                    Move during Summer. Freeze during Winter. Inspired by Squid Game!
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-text-dim text-sm uppercase tracking-wider">Level {level}/5</p>
                                <p className="font-heading text-2xl text-neon-purple">{score.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Game Container */}
                        <div
                            className="game-canvas-container relative touch-none"
                            onMouseMove={handleInput}
                            onTouchMove={handleInput}
                            onTouchStart={handleInput}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* Start Overlay */}
                            {!isPlaying && !isGameOver && !isWin && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <h2 className="font-heading text-4xl mb-2 glow-text" style={{ color: '#22d3ee' }}>
                                        🌙 Polar Night
                                    </h2>
                                    <p className="text-yellow-400 text-lg mb-6">Red Light, Green Light... in SPACE!</p>

                                    <div className="max-w-lg mb-8 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 211, 238, 0.2)' }}>
                                                <p className="text-2xl mb-1">☀️</p>
                                                <p className="font-bold" style={{ color: '#22d3ee' }}>SUMMER</p>
                                                <p className="text-sm text-text-dim">
                                                    <span className="hidden md:inline">Move mouse freely!</span>
                                                    <span className="md:hidden">Drag finger!</span>
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                                                <p className="text-2xl mb-1">❄️</p>
                                                <p className="font-bold text-blue-400">WINTER</p>
                                                <p className="text-sm text-text-dim">DON'T MOVE or you freeze!</p>
                                            </div>
                                        </div>
                                        <p className="text-text-secondary">
                                            Reach the green warp gate before time runs out!
                                        </p>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="px-12 py-4 text-xl font-bold rounded border-2 transition-all hover:scale-105 animate-pulse"
                                        style={{ borderColor: '#22d3ee', color: '#22d3ee' }}
                                    >
                                        🚀 Start Journey
                                    </button>
                                </div>
                            )}

                            {/* Game Over */}
                            {(isGameOver || isWin) && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <h2 className="font-heading text-4xl mb-4" style={{ color: isWin ? '#00ff00' : '#a5f3fc' }}>
                                        {isWin ? '🎉 URANUS CONQUERED!' : '❄️ FROZEN!'}
                                    </h2>
                                    {!isWin && (
                                        <p className="text-red-400 text-lg mb-4">You moved during Polar Night</p>
                                    )}
                                    <p className="text-2xl text-white mb-2">Score: {score.toLocaleString()}</p>
                                    <p className="text-xl text-yellow-400 mb-8">+{earnedStardust} Stardust</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-3 font-bold rounded border-2 transition-all hover:scale-105"
                                            style={{ borderColor: '#22d3ee', color: '#22d3ee' }}
                                        >
                                            {isWin ? 'Play Again' : 'Try Again'}
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
                                    <h2 className="font-heading text-2xl mb-4" style={{ color: '#22d3ee' }}>
                                        The Planet of Eternal Seasons
                                    </h2>
                                    <div className="prose prose-invert max-w-none text-text-secondary">
                                        <p>
                                            Uranus is tilted 98 degrees on its axis—it essentially rolls around the Sun
                                            on its side! This extreme tilt creates the most unusual seasons in the solar system.
                                        </p>
                                        <p>
                                            During Uranian summer, one pole points directly at the Sun for <strong>21 Earth years</strong>.
                                            Meanwhile, the opposite pole experiences complete darkness—a "polar night" that lasts
                                            for over two decades.
                                        </p>
                                        <h3 className="font-heading mt-6 mb-2" style={{ color: '#a855f7' }}>The Great Collision</h3>
                                        <p>
                                            Why is Uranus so tilted? Scientists believe that billions of years ago, an
                                            Earth-sized object slammed into the young planet, knocking it onto its side.
                                            This cosmic impact also created Uranus's unusual ring system and may have
                                            contributed to its extreme cold (-224°C).
                                        </p>
                                        <div className="bg-space-dark p-4 rounded-lg border-l-4 my-6" style={{ borderColor: '#22d3ee' }}>
                                            <p className="font-ui font-bold mb-1" style={{ color: '#22d3ee' }}>GAME CONNECTION</p>
                                            <p className="text-sm">
                                                This game simulates the extreme seasonal changes on Uranus. When Summer comes,
                                                you can move freely. But during the long Polar Night (Winter), you must stay
                                                completely still—or be frozen solid!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="planet-card">
                                    <h3 className="font-heading text-lg mb-4" style={{ color: '#a855f7' }}>
                                        Uranus Quick Facts
                                    </h3>
                                    <ul className="space-y-3 text-sm text-text-secondary">
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Axial Tilt</span>
                                            <span style={{ color: '#22d3ee' }}>98°</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Season Length</span>
                                            <span style={{ color: '#22d3ee' }}>21 Earth years</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Temperature</span>
                                            <span style={{ color: '#22d3ee' }}>-224°C</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span>Rings</span>
                                            <span style={{ color: '#22d3ee' }}>13 faint rings</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="planet-card" style={{ background: 'linear-gradient(to bottom right, rgba(6, 182, 212, 0.1), rgba(15, 23, 42, 0.5))' }}>
                                    <h3 className="font-heading text-lg mb-2" style={{ color: '#22d3ee' }}>
                                        Did You Know?
                                    </h3>
                                    <p className="text-sm text-text-dim italic">
                                        &quot;If you could stand on Uranus's north pole during summer, the Sun would
                                        appear to spiral around the sky for 42 years without setting—followed by
                                        42 years of complete darkness.&quot;
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>
                </main>

                <Footer />
            </>
        </PlanetGuard>
    );
}

