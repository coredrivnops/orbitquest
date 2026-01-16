'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import { PlutoGameLogic } from '@/games/pluto/PlutoGameLogic';
import { addStardust, updateHighScore } from '@/lib/localStorage';
import Link from 'next/link';

export default function PlutoGamePage() {
    const gameLogicRef = useRef<PlutoGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [credibility, setCredibility] = useState(100);
    const [streak, setStreak] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [stats, setStats] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        gameLogicRef.current = new PlutoGameLogic(1280, 720);
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
            setCredibility(game.credibility);
            setStreak(game.streak);
            setStats({ correct: game.correctAnswers, total: game.cardsAnswered });

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.stardustCollected, game.correctAnswers, game.cardsAnswered);
            }
        }
    };

    const handleGameOver = (finalScore: number, stardust: number, correct: number, total: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setStats({ correct, total });

        addStardust(stardust);
        updateHighScore('pluto', finalScore);

        window.dispatchEvent(new CustomEvent('stardust-earned', {
            detail: { amount: stardust }
        }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        game.handleMouseDown(x, y);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        game.handleMouseMove(x, y);
    };

    const handleMouseUp = () => {
        const game = gameLogicRef.current;
        if (!game) return;
        game.handleMouseUp();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 0) return;
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;

        const x = (e.touches[0].clientX - rect.left) * scaleX;
        const y = (e.touches[0].clientY - rect.top) * scaleY;

        game.handleMouseDown(x, y);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 0) return;
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;

        const x = (e.touches[0].clientX - rect.left) * scaleX;
        const y = (e.touches[0].clientY - rect.top) * scaleY;

        game.handleMouseMove(x, y);
    };

    const handleTouchEnd = () => {
        const game = gameLogicRef.current;
        if (!game) return;
        game.handleMouseUp();
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setScore(0);
        setCredibility(100);
        setStreak(0);
        setEarnedStardust(0);
        setStats({ correct: 0, total: 0 });
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
                                <h1 className="font-heading text-3xl text-purple-400">Pluto: Planet or Not?</h1>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full font-bold">FREE!</span>
                            </div>
                            <p className="text-text-secondary font-ui">
                                Swipe to classify celestial objects! Can you tell planets from non-planets?
                            </p>
                        </div>
                        <div className="text-right">
                            {streak > 1 && (
                                <p className="text-green-400 font-bold">🔥 {streak} Streak!</p>
                            )}
                            <p className="text-text-dim text-sm">{stats.correct}/{stats.total} correct</p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <div
                        className="game-canvas-container relative cursor-grab active:cursor-grabbing touch-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
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
                                    <div className="text-8xl">🪐</div>
                                    <div className="absolute -top-2 -right-8 text-4xl rotate-12">❓</div>
                                </div>

                                <h2 className="font-heading text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 mb-3">
                                    PLANET OR NOT?
                                </h2>
                                <p className="text-purple-300 text-xl mb-2">The Classification Challenge</p>
                                <p className="text-yellow-400 text-sm mb-8 max-w-md">
                                    🎉 FREE because Pluto knows the pain of being reclassified!
                                </p>

                                <div className="max-w-2xl mb-8 space-y-4">
                                    <div className="grid grid-cols-2 gap-6 text-sm">
                                        <div className="p-5 bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-xl border border-red-500/30">
                                            <div className="text-4xl mb-2">👈</div>
                                            <p className="text-red-400 font-bold text-lg">SWIPE LEFT</p>
                                            <p className="text-text-dim mt-1">NOT a Planet</p>
                                            <p className="text-xs text-text-dim mt-2">(Moons, asteroids, dwarf planets, stars...)</p>
                                        </div>
                                        <div className="p-5 bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl border border-green-500/30">
                                            <div className="text-4xl mb-2">👉</div>
                                            <p className="text-green-400 font-bold text-lg">SWIPE RIGHT</p>
                                            <p className="text-text-dim mt-1">IS a Planet</p>
                                            <p className="text-xs text-text-dim mt-2">(Mercury, Venus, Earth, Mars...)</p>
                                        </div>
                                    </div>

                                    <div className="bg-pink-900/30 p-4 rounded-lg border border-pink-500/20">
                                        <p className="text-pink-300 text-sm">
                                            <span className="font-bold">⚠️ Warning:</span> When Pluto appears...
                                            well, that&apos;s complicated! 😅
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-8 text-sm text-text-dim">
                                        <div>✓ Build streaks for bonus points</div>
                                        <div>✓ Learn fun facts about space</div>
                                        <div>✓ 25+ celestial objects</div>
                                    </div>
                                </div>

                                <button
                                    onClick={startGame}
                                    className="group relative px-12 py-5 text-xl font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 animate-gradient-x"></div>
                                    <div className="absolute inset-0.5 bg-space-deep rounded-xl"></div>
                                    <span className="relative text-white flex items-center gap-2">
                                        <span>🎴</span>
                                        <span>Start Classifying!</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* Game Over */}
                        {isGameOver && (
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10 backdrop-blur-sm">
                                <div className="text-5xl mb-4">📊</div>
                                <h2 className="font-heading text-4xl text-red-400 mb-2">
                                    Credibility Lost!
                                </h2>
                                <p className="text-purple-300 mb-6 italic">
                                    The IAU has revoked your classification license...
                                </p>

                                <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                    <div className="bg-space-tertiary/50 p-4 rounded-lg">
                                        <p className="text-3xl font-bold text-white">{stats.correct}/{stats.total}</p>
                                        <p className="text-text-dim text-sm">Correct</p>
                                    </div>
                                    <div className="bg-space-tertiary/50 p-4 rounded-lg">
                                        <p className="text-3xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                        <p className="text-text-dim text-sm">Stardust</p>
                                    </div>
                                    <div className="bg-space-tertiary/50 p-4 rounded-lg">
                                        <p className="text-3xl font-bold text-green-400">{score.toLocaleString()}</p>
                                        <p className="text-text-dim text-sm">Score</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={startGame}
                                        className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold transition-all hover:scale-105"
                                    >
                                        🔄 Try Again
                                    </button>
                                    <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                                        Return to Hub
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ad Slot */}
                    <div className="my-8 h-[90px] bg-space-tertiary/30 rounded-lg border border-white/5 flex items-center justify-center">
                        <span className="text-text-dim text-sm opacity-50">Advertisement</span>
                    </div>

                    {/* Educational Content */}
                    <section className="mt-8 space-y-12">

                        <article className="planet-card bg-gradient-to-br from-purple-900/30 to-pink-900/20">
                            <h2 className="font-heading text-3xl text-purple-400 mb-6">
                                What Makes a Planet a Planet?
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    In 2006, the International Astronomical Union (IAU) created a formal definition
                                    for what qualifies as a planet. This decision famously reclassified Pluto and
                                    sparked debates that continue to this day!
                                </p>

                                <div className="bg-purple-900/30 p-6 rounded-lg border-l-4 border-pink-500 my-8">
                                    <p className="font-ui text-pink-400 font-bold mb-4">📜 THE THREE RULES</p>
                                    <ol className="space-y-3 text-white">
                                        <li><strong>1. Orbits the Sun</strong> - Must go around our star, not another planet</li>
                                        <li><strong>2. Has enough mass for gravity to make it round</strong> - No potato shapes!</li>
                                        <li><strong>3. Has &quot;cleared&quot; its orbital neighborhood</strong> - It&apos;s the dominant object in its orbit</li>
                                    </ol>
                                    <p className="text-pink-300 mt-4 italic">
                                        Pluto fails Rule #3 - it shares its orbital zone with other Kuiper Belt objects!
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl text-purple-400 mt-8 mb-4">Why This Game?</h3>
                                <p>
                                    &quot;Planet or Not?&quot; teaches you to classify celestial objects using the same
                                    criteria that astronomers use. As you swipe through cards, you&apos;ll learn
                                    the difference between planets, dwarf planets, moons, asteroids, and more
                                    - all while having fun!
                                </p>
                            </div>
                        </article>

                        {/* Quick Classification Guide */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="planet-card border-green-500/30">
                                <h3 className="font-heading text-xl text-green-400 mb-4">✓ PLANETS (Swipe Right!)</h3>
                                <ul className="space-y-2 text-text-secondary">
                                    <li><span className="text-white font-bold">Mercury</span> - Smallest, closest to Sun</li>
                                    <li><span className="text-white font-bold">Venus</span> - Hottest, spins backwards</li>
                                    <li><span className="text-white font-bold">Earth</span> - Our home!</li>
                                    <li><span className="text-white font-bold">Mars</span> - The Red Planet</li>
                                    <li><span className="text-white font-bold">Jupiter</span> - Largest planet</li>
                                    <li><span className="text-white font-bold">Saturn</span> - Beautiful rings</li>
                                    <li><span className="text-white font-bold">Uranus</span> - Tilted sideways</li>
                                    <li><span className="text-white font-bold">Neptune</span> - Fastest winds</li>
                                </ul>
                                <p className="text-green-400 text-sm mt-4 italic">Just 8 planets in our solar system!</p>
                            </div>

                            <div className="planet-card border-red-500/30">
                                <h3 className="font-heading text-xl text-red-400 mb-4">✗ NOT PLANETS (Swipe Left!)</h3>
                                <ul className="space-y-2 text-text-secondary">
                                    <li><span className="text-white font-bold">Dwarf Planets</span> - Pluto, Ceres, Eris...</li>
                                    <li><span className="text-white font-bold">Moons</span> - Orbit planets, not the Sun</li>
                                    <li><span className="text-white font-bold">Asteroids</span> - Rocky debris</li>
                                    <li><span className="text-white font-bold">Comets</span> - Icy with tails</li>
                                    <li><span className="text-white font-bold">Stars</span> - Including our Sun!</li>
                                    <li><span className="text-white font-bold">Satellites</span> - Human-made objects</li>
                                </ul>
                                <p className="text-pink-400 text-sm mt-4 italic">
                                    When Pluto appears... it&apos;s technically NOT a planet, but we understand if you struggle! 💔
                                </p>
                            </div>
                        </div>

                    </section>

                    {/* Ad Slot */}
                    <div className="my-8 h-[250px] bg-space-tertiary/30 rounded-lg border border-white/5 flex items-center justify-center">
                        <span className="text-text-dim text-sm opacity-50">Advertisement</span>
                    </div>

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
