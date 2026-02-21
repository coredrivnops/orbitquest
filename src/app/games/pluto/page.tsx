'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import { PlutoGameLogic } from '@/games/pluto/PlutoGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function PlutoGamePage() {
    const gameLogicRef = useRef<PlutoGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [wave, setWave] = useState(0);
    const [moonShields, setMoonShields] = useState(5);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    // Mouse state
    const isShootingRef = useRef(false);

    useEffect(() => {
        gameLogicRef.current = new PlutoGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number, deltaTime: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying) {
            game.update(deltaTime);
        }
        game.draw(ctx);

        if (frameCount % 6 === 0) {
            setScore(game.score);
            setWave(game.waveNumber);
            setMoonShields(game.moons.filter(m => m.alive).length);

            // Check for trivia trigger
            if (game.showTrivia && !showTrivia && game.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(game.currentTrivia);
                setTriviaAnswered(false);
            }

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.stardustCollected, game.waveNumber);
            }
        }
    };

    const handleGameOver = (finalScore: number, stardust: number, waveReached: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setWave(waveReached);

        addStardust(stardust);
        updateHighScore('pluto', finalScore);
        markGamePlayed('pluto');

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

    const handleMouseMove = (e: React.MouseEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = game.width / rect.width;
        const scaleY = game.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        game.handleInput(x, y, isShootingRef.current);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isShootingRef.current = true;
        handleMouseMove(e);
    };

    const handleMouseUp = () => {
        isShootingRef.current = false;
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

        game.handleInput(x, y, true);
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setShowTrivia(false);
        setScore(0);
        setWave(0);
        setMoonShields(5);
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
                                <h1 className="font-heading text-3xl text-pink-400">Pluto: Orbit Defender</h1>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full font-bold">FREE!</span>
                            </div>
                            <p className="text-text-secondary font-ui">
                                Defend Pluto from Kuiper Belt invaders! Your moons are your shields.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-text-dim text-sm uppercase tracking-wider">Wave {wave}</p>
                            <p className={`font-heading text-xl ${moonShields > 2 ? 'text-green-400' : moonShields > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                🌙 {moonShields}/5 Shields
                            </p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <div
                        className="game-canvas-container relative cursor-crosshair touch-none select-none"
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchMove={handleTouchMove}
                        onTouchStart={handleTouchMove}
                    >
                        <GameCanvas
                            onGameLoop={handleGameLoop}
                            width={1280}
                            height={720}
                        />

                        {/* Start Overlay */}
                        {!isPlaying && !isGameOver && (
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10">
                                {/* Retro arcade title */}
                                <div className="relative mb-4">
                                    <h2 className="font-heading text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 tracking-wider animate-pulse">
                                        ORBIT DEFENDER
                                    </h2>
                                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-xl -z-10" />
                                </div>

                                <p className="text-pink-300 text-xl mb-2">A Retro Arcade Experience</p>
                                <p className="text-yellow-400 text-sm mb-8">🎉 FREE - Because Pluto deserves some love!</p>

                                {/* Controls */}
                                <div className="max-w-2xl mb-8">
                                    <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                                        <div className="p-4 bg-gradient-to-br from-pink-900/40 to-purple-900/30 rounded-xl border border-pink-500/30">
                                            <div className="text-3xl mb-2">🎯</div>
                                            <p className="text-pink-400 font-bold">AIM</p>
                                            <p className="text-text-dim text-xs mt-1">
                                                <span className="hidden md:inline">Move mouse</span>
                                                <span className="md:hidden">Drag finger</span>
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-pink-900/40 to-purple-900/30 rounded-xl border border-pink-500/30">
                                            <div className="text-3xl mb-2">🔫</div>
                                            <p className="text-cyan-400 font-bold">SHOOT</p>
                                            <p className="text-text-dim text-xs mt-1">
                                                <span className="hidden md:inline">Click & hold</span>
                                                <span className="md:hidden">Tap & hold</span>
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-pink-900/40 to-purple-900/30 rounded-xl border border-pink-500/30">
                                            <div className="text-3xl mb-2">🛡️</div>
                                            <p className="text-green-400 font-bold">SURVIVE</p>
                                            <p className="text-text-dim text-xs mt-1">Moons protect you!</p>
                                        </div>
                                    </div>

                                    {/* Power-ups preview */}
                                    <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20 mb-6">
                                        <p className="text-purple-300 text-sm font-bold mb-2">⬡ POWER-UPS</p>
                                        <div className="flex justify-center gap-4 text-xl">
                                            <span title="Rapid Fire">⚡</span>
                                            <span title="Spread Shot">🔥</span>
                                            <span title="Shield Restore">🛡️</span>
                                            <span title="Freeze">❄️</span>
                                            <span title="Nuke">💥</span>
                                            <span title="Heart Shield">❤️</span>
                                        </div>
                                    </div>

                                    <p className="text-text-secondary italic text-sm">
                                        &quot;They may have demoted me, but they can&apos;t stop me from defending my orbit!&quot;
                                    </p>
                                </div>

                                <button
                                    onClick={startGame}
                                    className="group relative px-12 py-5 text-xl font-heading rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 animate-gradient-x"></div>
                                    <div className="absolute inset-0.5 bg-space-deep rounded-xl"></div>
                                    <span className="relative text-white flex items-center gap-3">
                                        <span className="text-2xl">🚀</span>
                                        <span>DEFEND PLUTO</span>
                                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                                    </span>
                                </button>

                                <p className="text-text-dim text-xs mt-6">Press START or click anywhere to begin</p>
                            </div>
                        )}

                        {/* Trivia Overlay */}
                        {showTrivia && triviaQuestion && (
                            <div className="absolute inset-0 bg-purple-950/95 flex flex-col items-center justify-center p-8 text-center z-20 backdrop-blur-sm">
                                <div className="text-4xl mb-4">🧠</div>
                                <h3 className="font-heading text-2xl text-pink-400 mb-2">WAVE COMPLETE!</h3>
                                <p className="text-text-dim mb-4">Answer correctly to restore a moon shield!</p>
                                <p className="text-white text-xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                {!triviaAnswered ? (
                                    <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                        {triviaQuestion.answers.map((answer: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleTriviaAnswer(idx)}
                                                className="p-4 bg-purple-800/50 hover:bg-purple-700/60 border border-purple-400/30 rounded-xl text-white transition-all hover:scale-105 hover:border-pink-400/50"
                                            >
                                                {answer}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="max-w-lg">
                                        <p className={`text-3xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                            {triviaCorrect ? '✅ CORRECT! +5⭐ & Moon Restored!' : '❌ WRONG!'}
                                        </p>
                                        <p className="text-purple-200 text-sm bg-purple-900/50 p-4 rounded-lg">
                                            💡 {triviaQuestion.fact}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Game Over */}
                        {isGameOver && (
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10 backdrop-blur-sm">
                                <div className="text-6xl mb-4 animate-pulse">💥</div>
                                <h2 className="font-heading text-5xl text-red-400 mb-2">
                                    GAME OVER
                                </h2>
                                <p className="text-pink-300 mb-6 italic text-lg">
                                    Pluto has been hit! The Kuiper Belt claims another...
                                </p>

                                <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                    <div className="bg-space-tertiary/50 p-5 rounded-xl border border-pink-500/30">
                                        <p className="text-4xl font-bold text-white">{wave}</p>
                                        <p className="text-text-dim text-sm">Waves</p>
                                    </div>
                                    <div className="bg-space-tertiary/50 p-5 rounded-xl border border-yellow-500/30">
                                        <p className="text-4xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                        <p className="text-text-dim text-sm">Stardust</p>
                                    </div>
                                    <div className="bg-space-tertiary/50 p-5 rounded-xl border border-cyan-500/30">
                                        <p className="text-4xl font-bold text-cyan-400">{score.toLocaleString()}</p>
                                        <p className="text-text-dim text-sm">Score</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={startGame}
                                        className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                    >
                                        🔄 PLAY AGAIN
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

                        <article className="planet-card bg-gradient-to-br from-pink-900/30 to-purple-900/20">
                            <h2 className="font-heading text-3xl text-pink-400 mb-6">
                                Pluto: The Dwarf Planet That Stole Our Hearts
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    For 76 years, Pluto was the ninth planet in our solar system. Discovered in 1930
                                    by Clyde Tombaugh, it captured the imagination of generations. That all changed
                                    in 2006 when the International Astronomical Union reclassified Pluto as a
                                    &quot;dwarf planet&quot; — but that hasn&apos;t diminished our love for this distant world!
                                </p>

                                <div className="bg-purple-900/30 p-6 rounded-lg border-l-4 border-pink-500 my-8">
                                    <p className="font-ui text-pink-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        In Orbit Defender, you protect Pluto from the Kuiper Belt objects that
                                        share its orbital neighborhood — the very reason it was &quot;demoted&quot;!
                                        Your 5 moon shields (Charon, Nix, Hydra, Kerberos, and Styx) help you
                                        survive the onslaught. It&apos;s Pluto&apos;s revenge against the cosmos!
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl text-pink-400 mt-8 mb-4">Why Pluto Matters</h3>
                                <p>
                                    Despite its reclassification, Pluto remains scientifically fascinating.
                                    NASA&apos;s New Horizons mission in 2015 revealed a world far more complex
                                    than anyone imagined — with ice mountains, nitrogen glaciers, and most
                                    famously, the heart-shaped Tombaugh Regio that charmed the world.
                                </p>
                            </div>
                        </article>

                        {/* Quick Facts */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-pink-400 mb-4">📊 Pluto Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Diameter</span>
                                        <span className="text-pink-400">2,377 km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Discovery</span>
                                        <span className="text-pink-400">1930</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Moons</span>
                                        <span className="text-pink-400">5 known</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbit Period</span>
                                        <span className="text-pink-400">248 years</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Status</span>
                                        <span className="text-yellow-400">Dwarf Planet ❤️</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-purple-400 mb-4">🌙 The Moon Shields</h3>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-white">Charon</span>
                                        <span className="text-purple-400">Half Pluto&apos;s size!</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-white">Nix</span>
                                        <span className="text-purple-400">~50 km wide</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-white">Hydra</span>
                                        <span className="text-purple-400">~55 km wide</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-white">Kerberos</span>
                                        <span className="text-purple-400">~12 km wide</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-white">Styx</span>
                                        <span className="text-purple-400">~10 km wide</span>
                                    </div>
                                </div>
                            </div>

                            <div className="planet-card bg-gradient-to-br from-green-900/20 to-space-tertiary">
                                <h3 className="font-heading text-xl text-green-400 mb-4">🎉 Why It&apos;s FREE</h3>
                                <p className="text-text-dim italic text-sm mb-4">
                                    &quot;If they won&apos;t count me as a planet, I won&apos;t count as an unlock cost!&quot;
                                </p>
                                <p className="text-text-secondary text-sm">
                                    Pluto&apos;s game is free as a tribute to the underdog of our solar system.
                                    Start here, master the basics, then journey through the planets to reach Earth!
                                </p>
                                <p className="text-green-400 font-bold text-sm mt-4">
                                    Earn stardust here to unlock Neptune! 🚀
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

