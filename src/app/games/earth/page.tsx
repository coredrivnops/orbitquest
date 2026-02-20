'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { EarthGameLogic } from '@/games/earth/EarthGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function EarthGamePage() {
    const gameLogicRef = useRef<EarthGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(150);
    const [maxHealth] = useState(150);
    const [level, setLevel] = useState(1);
    const [combo, setCombo] = useState(0);
    const [waveNumber, setWaveNumber] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [killStreakMessage, setKillStreakMessage] = useState('');

    // Level up state
    const [showLevelUp, setShowLevelUp] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [levelUpChoices, setLevelUpChoices] = useState<any[]>([]);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);
    const [triviaFact, setTriviaFact] = useState('');

    useEffect(() => {
        gameLogicRef.current = new EarthGameLogic(1280, 720);

        const game = gameLogicRef.current;
        game.onScoreUpdate = (s) => setScore(s);
        game.onHealthUpdate = (h) => setHealth(h);
        game.onStardustCollected = (amt) => setEarnedStardust(prev => prev + amt);
        game.onLevelUp = (choices) => {
            setShowLevelUp(true);
            setLevelUpChoices(choices);
        };
        game.onKillStreak = (streak, name) => {
            setKillStreakMessage(name);
            setTimeout(() => setKillStreakMessage(''), 2000);
        };
        game.onGameOver = () => {
            setIsGameOver(true);
            if (gameLogicRef.current) {
                const finalScore = gameLogicRef.current.score;
                const stardust = gameLogicRef.current.sessionStardust;
                addStardust(stardust);
                updateHighScore('earth', finalScore);
                markGamePlayed('earth');
                setEarnedStardust(stardust);
                window.dispatchEvent(new CustomEvent('stardust-earned', {
                    detail: { amount: stardust }
                }));
            }
        };
        game.onTriviaShow = (q) => {
            setShowTrivia(true);
            setTriviaQuestion(q);
            setTriviaAnswered(false);
            setTriviaFact('');
        };
        game.onTriviaResult = (correct, fact) => {
            setTriviaAnswered(true);
            setTriviaCorrect(correct);
            setTriviaFact(fact);
        };

        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    // Touch/Mouse controls
    const handleMouseMove = (e: React.MouseEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (1280 / rect.width);
        const y = (e.clientY - rect.top) * (720 / rect.height);

        game.handleMouseMove(x, y);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying) return;

        // Prevent default scrolling behavior
        // e.preventDefault(); // Note: React's synthetic events might not support this directly here, usually done in CSS touch-action

        if (e.touches.length > 0) {
            const canvas = e.currentTarget as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();
            const x = (e.touches[0].clientX - rect.left) * (1280 / rect.width);
            const y = (e.touches[0].clientY - rect.top) * (720 / rect.height);

            game.handleMouseMove(x, y);
        }
    };

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying && !showTrivia && !showLevelUp) {
            game.update();
        }
        game.draw(ctx);

        // Update state periodically
        if (frameCount % 10 === 0) {
            setScore(game.score);
            setHealth(game.earthHealth);
            setLevel(game.level);
            setCombo(game.combo);
            setWaveNumber(game.waveNumber);
            setEarnedStardust(game.sessionStardust);

            // Check level up
            if (game.showLevelUp && !showLevelUp) {
                setShowLevelUp(true);
                setLevelUpChoices(game.levelUpChoices);
            }

            // Check trivia
            if (game.showTrivia && !showTrivia && game.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(game.currentTrivia);
                setTriviaAnswered(false);
            }
            if (!game.showTrivia && showTrivia) {
                setShowTrivia(false);
                setTriviaQuestion(null);
            }
        }
    };

    const handleUpgradeSelect = (index: number) => {
        const game = gameLogicRef.current;
        if (game) {
            game.selectUpgrade(index);
            setShowLevelUp(false);
        }
    };

    const handleTriviaAnswer = (index: number) => {
        const game = gameLogicRef.current;
        if (game && !triviaAnswered) {
            setTriviaAnswered(true);
            const correct = index === game.currentTrivia?.correct;
            setTriviaCorrect(correct);
            game.answerTrivia(index);

            setTimeout(() => {
                setShowTrivia(false);
                setTriviaQuestion(null);
                setTriviaAnswered(false);
            }, 2000);
        }
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setShowTrivia(false);
        setShowLevelUp(false);
        setScore(0);
        setHealth(100);
        setLevel(1);
        setCombo(0);
        setWaveNumber(1);
        setEarnedStardust(0);
    };

    return (
        <>
            <Header />

            <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-space-deep via-blue-950 to-space-deep">
                <div className="container mx-auto px-4">
                    {/* Game Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="font-heading text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                                Earth: Last Stand <span className="ml-2 text-sm px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full">⭐ 3000</span>
                            </h1>
                            <p className="text-text-dim mt-2">Defend Earth from alien invasion! Auto-fire weapons, collect XP, evolve your arsenal!</p>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-400 text-xl font-bold">🌊 Wave {waveNumber}</p>
                            <p className="text-text-dim text-sm">Level {level} • {combo > 1 ? `${combo}x Combo!` : 'Build combos!'}</p>
                        </div>
                    </div>

                    {/* Game Canvas Area */}
                    <PlanetGuard planetId="earth">
                        <div className="relative max-w-[1280px] mx-auto">
                            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-red-500/20 border border-red-500/30">
                                <div
                                    className="game-canvas-container relative cursor-none touch-none select-none"
                                    onMouseMove={handleMouseMove}
                                    onTouchMove={handleTouchMove}
                                    onTouchStart={handleTouchMove}
                                >
                                    <GameCanvas
                                        width={1280}
                                        height={720}
                                        onGameLoop={handleGameLoop}
                                        className="w-full cursor-crosshair"
                                    />
                                </div>

                                {/* HUD Overlay */}
                                {isPlaying && !isGameOver && (
                                    <div className="absolute top-4 left-4 flex items-center gap-4">
                                        {/* Health */}
                                        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-500/30">
                                            <div className="text-xs text-red-300 mb-1">🌍 EARTH HEALTH</div>
                                            <div className="w-40 h-3 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${health > maxHealth * 0.5 ? 'bg-green-500' : health > maxHealth * 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${(health / maxHealth) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        {/* Score */}
                                        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-500/30">
                                            <div className="text-xs text-yellow-300 mb-1">⭐ SCORE</div>
                                            <div className="text-xl font-bold text-yellow-400">{score.toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Kill Streak Notification */}
                                {killStreakMessage && (
                                    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse">
                                            {killStreakMessage}
                                        </div>
                                    </div>
                                )}

                                {/* Start Overlay */}
                                {!isPlaying && !isGameOver && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-950/98 via-space-deep/98 to-orange-950/98 flex flex-col items-center justify-center p-4 text-center z-10">
                                        <div className="relative mb-4">
                                            <h2 className="font-heading text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 tracking-wider animate-pulse">
                                                LAST STAND
                                            </h2>
                                            <p className="text-orange-300 text-2xl mt-2">🌍 DEFEND EARTH 🛸</p>
                                            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-orange-500/30 to-yellow-500/20 blur-xl -z-10" />
                                        </div>

                                        <div className="max-w-lg mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/20">
                                            <p className="text-orange-200 italic text-sm">
                                                &ldquo;The aliens have arrived. You are Earth&apos;s last line of defense.
                                                Your weapons fire automatically - just move and survive!&rdquo;
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
                                            <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                                                <div className="text-2xl mb-1">⚡</div>
                                                <div className="text-orange-300 font-bold text-sm">Auto-Fire</div>
                                                <div className="text-text-dim text-xs">Weapons shoot automatically</div>
                                            </div>
                                            <div className="bg-black/40 rounded-lg p-3 border border-yellow-500/30">
                                                <div className="text-2xl mb-1">🎯</div>
                                                <div className="text-yellow-300 font-bold text-sm">
                                                    <span className="hidden md:inline">Mouse</span>
                                                    <span className="md:hidden">Drag</span>
                                                </div>
                                                <div className="text-text-dim text-xs">Control your satellite</div>
                                            </div>
                                            <div className="bg-black/40 rounded-lg p-3 border border-green-500/30">
                                                <div className="text-2xl mb-1">💎</div>
                                                <div className="text-green-300 font-bold text-sm">Collect XP</div>
                                                <div className="text-text-dim text-xs">Level up & evolve weapons</div>
                                            </div>
                                            <div className="bg-black/40 rounded-lg p-3 border border-purple-500/30">
                                                <div className="text-2xl mb-1">🔥</div>
                                                <div className="text-purple-300 font-bold text-sm">Build Combos</div>
                                                <div className="text-text-dim text-xs">Chain kills for bonus damage</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={startGame}
                                            className="px-10 py-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white font-bold text-xl rounded-full shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-105 transition-all duration-300 animate-pulse"
                                        >
                                            🚀 DEFEND EARTH →
                                        </button>
                                    </div>
                                )}

                                {/* Level Up Overlay */}
                                {showLevelUp && isPlaying && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                        <h2 className="font-heading text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-2">
                                            LEVEL UP!
                                        </h2>
                                        <p className="text-green-300 mb-6">Choose your upgrade:</p>

                                        <div className="flex gap-4">
                                            {levelUpChoices.map((choice, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleUpgradeSelect(index)}
                                                    className="w-48 p-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-cyan-500/50 hover:border-cyan-400 hover:scale-105 transition-all duration-200 text-center"
                                                >
                                                    <div className="text-3xl mb-2">{choice.name.split(' ')[0]}</div>
                                                    <div className="text-cyan-300 font-bold">{choice.name.split(' ').slice(1).join(' ')}</div>
                                                    <div className="text-text-dim text-sm mt-1">{choice.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Trivia Overlay */}
                                {showTrivia && triviaQuestion && (
                                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-8">
                                        <div className="text-4xl mb-2">🌍</div>
                                        <h3 className="text-2xl font-bold text-blue-300 mb-4 text-center max-w-xl">
                                            {triviaQuestion.question}
                                        </h3>

                                        {!triviaAnswered ? (
                                            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                                {triviaQuestion.answers.map((answer: string, index: number) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleTriviaAnswer(index)}
                                                        className="p-3 bg-gradient-to-r from-blue-800/80 to-blue-900/80 rounded-lg border border-blue-500/50 hover:border-blue-400 hover:bg-blue-700/80 transition-all text-white font-medium"
                                                    >
                                                        {answer}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className={`text-3xl mb-3 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                    {triviaCorrect ? '✅ Correct! +500 points!' : '❌ Not quite!'}
                                                </div>
                                                <p className="text-blue-200 max-w-md">{triviaFact || triviaQuestion.fact}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Game Over Overlay */}
                                {isGameOver && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-950/95 via-black/95 to-red-950/95 flex flex-col items-center justify-center z-20">
                                        <div className="text-6xl mb-4">💥</div>
                                        <h2 className="font-heading text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                                            EARTH FELL
                                        </h2>
                                        <p className="text-red-300 mb-8">The aliens have overwhelmed our defenses...</p>

                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            <div className="text-center bg-black/40 rounded-xl p-4 border border-orange-500/30">
                                                <div className="text-orange-400 text-sm">Waves Survived</div>
                                                <div className="text-3xl font-bold text-white">{waveNumber}</div>
                                            </div>
                                            <div className="text-center bg-black/40 rounded-xl p-4 border border-yellow-500/30">
                                                <div className="text-yellow-400 text-sm">Stardust</div>
                                                <div className="text-3xl font-bold text-yellow-300">⭐ {earnedStardust}</div>
                                            </div>
                                            <div className="text-center bg-black/40 rounded-xl p-4 border border-cyan-500/30">
                                                <div className="text-cyan-400 text-sm">Score</div>
                                                <div className="text-3xl font-bold text-white">{score.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={startGame}
                                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-full hover:scale-105 transition-all"
                                            >
                                                🔄 DEFEND AGAIN
                                            </button>
                                            <Link href="/solar-system" className="px-8 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-all border border-gray-600">
                                                Return to Hub
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </PlanetGuard>

                    {/* Educational Content */}
                    <section className="mt-8 space-y-8">
                        <article className="planet-card bg-gradient-to-br from-blue-900/30 via-green-900/20 to-cyan-900/30">
                            <h2 className="font-heading text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-6">
                                🌍 Earth: Our Pale Blue Dot
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    Earth is the third planet from the Sun and the only known astronomical object to harbor life.
                                    Our planet formed approximately <strong className="text-blue-400">4.54 billion years ago</strong> and
                                    is the densest planet in our solar system, with a mean radius of 6,371 km. Earth&apos;s surface is
                                    71% water, making it unique among the rocky planets.
                                </p>

                                <div className="bg-blue-900/30 p-6 rounded-lg border-l-4 border-blue-500 my-6">
                                    <p className="font-ui text-blue-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        In this game, you control a defense satellite protecting Earth from alien invasion.
                                        The satellite orbits in the region where real satellites like the ISS operate -
                                        about 400 km above Earth&apos;s surface in Low Earth Orbit (LEO).
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl text-green-400 mt-8 mb-4">🛡️ Earth&apos;s Protective Shield</h3>
                                <p>
                                    Earth&apos;s <strong className="text-cyan-400">magnetic field</strong> (magnetosphere) extends
                                    thousands of kilometers into space and protects us from harmful solar radiation. This invisible
                                    shield deflects charged particles from the Sun, creating the beautiful auroras at the poles.
                                </p>

                                <h3 className="font-heading text-xl text-green-400 mt-8 mb-4">🌡️ The Atmosphere</h3>
                                <p>
                                    Our atmosphere consists of 78% nitrogen, 21% oxygen, and 1% other gases including argon and CO₂.
                                    This thin layer - only about 100 km thick before fading into space - is what makes life possible
                                    by regulating temperature and blocking harmful UV radiation.
                                </p>
                            </div>
                        </article>

                        {/* Quick Facts Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-blue-400 mb-4">📊 Earth Quick Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Distance from Sun</span>
                                        <span className="text-blue-400">150 million km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbital Period</span>
                                        <span className="text-blue-400">365.25 days</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Rotation Period</span>
                                        <span className="text-blue-400">23h 56m</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Surface Gravity</span>
                                        <span className="text-blue-400">9.8 m/s²</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Natural Satellites</span>
                                        <span className="text-blue-400">1 (The Moon)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-green-400 mb-4">🌊 What Makes Earth Special</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">💧</span>
                                        <span><strong>Liquid Water</strong> - Essential for all known life</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">🧲</span>
                                        <span><strong>Magnetic Field</strong> - Protects from solar wind</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">🌡️</span>
                                        <span><strong>Goldilocks Zone</strong> - Perfect temperature for life</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">🌙</span>
                                        <span><strong>Large Moon</strong> - Stabilizes our axis tilt</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-cyan-400 mb-4">🎯 Game Tips</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-400">✓</span>
                                        <span>Collect XP orbs to level up weapons</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-400">✓</span>
                                        <span>Mix weapon types for combo attacks</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-400">✓</span>
                                        <span>Lightning chains between enemies!</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-400">✓</span>
                                        <span>Prioritize Elite and Boss aliens</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}

