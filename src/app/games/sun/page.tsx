'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import { loadProgress, addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import { isBossChallengeUnlocked, getGamesRequiredForBoss, PLANETS } from '@/lib/gameTypes';
import { SunGameLogic } from '@/games/sun/SunGameLogic';
import Confetti from '@/components/Confetti';

// FAQ Schema for SEO
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How hot is the Sun?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Sun's surface temperature is about 5,500°C (9,932°F), but its core reaches an incredible 15 million degrees Celsius! This extreme heat is what enables nuclear fusion to occur."
            }
        },
        {
            "@type": "Question",
            "name": "How big is the Sun compared to Earth?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Sun is enormous - about 1.3 million Earths could fit inside it! Its diameter is about 1.4 million kilometers, making it 109 times wider than Earth."
            }
        },
        {
            "@type": "Question",
            "name": "What is the Sun made of?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Sun is composed primarily of hydrogen (about 74%) and helium (about 24%). The remaining 2% includes heavier elements like oxygen, carbon, neon, and iron."
            }
        },
        {
            "@type": "Question",
            "name": "How old is the Sun?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our Sun is approximately 4.6 billion years old and is considered middle-aged for a star of its type. It will continue to burn for another 5 billion years before becoming a red giant."
            }
        }
    ]
};

export default function SunGamePage() {
    const gameLogicRef = useRef<SunGameLogic | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [gamesNeeded, setGamesNeeded] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isVictory, setIsVictory] = useState(false);
    const [showTrivia, setShowTrivia] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const [score, setScore] = useState(0);
    const [wave, setWave] = useState(1);
    const [lives, setLives] = useState(3);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const [triviaQuestion, setTriviaQuestion] = useState<{
        question: string;
        answers: string[];
        correct: number;
        fact: string;
    } | null>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    const keysRef = useRef<Set<string>>(new Set());

    // Check if boss is unlocked
    useEffect(() => {
        const progress = loadProgress();
        const gamesPlayed = progress.gamesPlayedAtLeastOnce || [];
        const unlocked = isBossChallengeUnlocked(gamesPlayed);
        setIsUnlocked(unlocked);

        if (!unlocked) {
            const required = getGamesRequiredForBoss();
            const needed = required.filter(id => !gamesPlayed.includes(id));
            setGamesNeeded(needed);
        }

        setHighScore(progress.highScores['sun'] || 0);
        setIsLoading(false);
    }, []);

    // Keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysRef.current.add(e.key.toLowerCase());
            if (e.key === ' ' || e.key === 'Escape') e.preventDefault();
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current.delete(e.key.toLowerCase());
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleGameLoop = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
        if (!gameLogicRef.current) {
            gameLogicRef.current = new SunGameLogic(1280, 720);
        }

        const game = gameLogicRef.current;
        if (!isPlaying || isGameOver || isVictory) {
            game.draw(ctx);
            return;
        }

        // Handle input
        const keys = keysRef.current;
        if (keys.has('a') || keys.has('arrowleft')) game.handleInput('left');
        if (keys.has('d') || keys.has('arrowright')) game.handleInput('right');
        if (keys.has('w') || keys.has('arrowup')) game.handleInput('up');
        if (keys.has('s') || keys.has('arrowdown')) game.handleInput('down');
        if (keys.has(' ')) game.handleInput('shoot');

        game.update();
        game.draw(ctx);

        // Sync state every 6 frames
        if (frameCount % 6 === 0) {
            const state = game.getState();
            setScore(state.score);
            setWave(state.wave);
            setLives(state.lives);

            if (state.showTrivia && !showTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(state.currentTrivia);
                setTriviaAnswered(false);
            }

            if (state.triviaAnswered && !triviaAnswered) {
                setTriviaAnswered(true);
                setTriviaCorrect(state.triviaCorrect);
            }

            if (!state.showTrivia && showTrivia) {
                setShowTrivia(false);
                setTriviaQuestion(null);
            }

            if (state.isGameOver && !isGameOver) {
                handleGameOver(state.score, state.stardustCollected);
            }

            if (state.isVictory && !isVictory) {
                handleVictory(state.score, state.stardustCollected);
            }
        }
    }, [isPlaying, isGameOver, isVictory, showTrivia, triviaAnswered]);

    const handleGameOver = (finalScore: number, stardust: number) => {
        setIsGameOver(true);
        setIsPlaying(false);
        setEarnedStardust(stardust);

        addStardust(stardust);
        updateHighScore('sun', finalScore);
        markGamePlayed('sun');

        window.dispatchEvent(new CustomEvent('stardust-earned', {
            detail: { amount: stardust }
        }));
    };

    const handleVictory = (finalScore: number, stardust: number) => {
        setIsVictory(true);
        setIsPlaying(false);
        setEarnedStardust(stardust);
        setShowConfetti(true);

        addStardust(stardust);
        updateHighScore('sun', finalScore);
        markGamePlayed('sun');

        window.dispatchEvent(new CustomEvent('stardust-earned', {
            detail: { amount: stardust }
        }));
    };

    const handleTriviaAnswer = (index: number) => {
        if (!gameLogicRef.current || triviaAnswered) return;
        gameLogicRef.current.answerTrivia(index);
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setIsVictory(false);
        setShowTrivia(false);
        setScore(0);
        setWave(1);
        setLives(3);
        setEarnedStardust(0);
    };

    const handleTouch = (key: string, pressed: boolean) => {
        if (pressed) keysRef.current.add(key);
        else keysRef.current.delete(key);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-space-deep flex items-center justify-center">
                <div className="animate-spin text-6xl">☀️</div>
            </div>
        );
    }

    // Locked state
    if (!isUnlocked) {
        const requiredGames = getGamesRequiredForBoss();
        const progress = loadProgress();
        const gamesPlayed = progress.gamesPlayedAtLeastOnce || [];
        const playedCount = gamesPlayed.length;

        return (
            <>
                <Header />
                <main className="flex-1 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="planet-card bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-red-900/20 text-center py-12">
                            {/* Locked Sun */}
                            <div className="relative mx-auto w-48 h-48 mb-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-600/30 rounded-full blur-xl animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-8xl grayscale opacity-50">☀️</span>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl">🔒</span>
                                    </div>
                                </div>
                            </div>

                            <h1 className="font-heading text-4xl md:text-5xl text-white mb-4">
                                Final Boss: <span className="text-amber-400">Solar Showdown</span>
                            </h1>

                            <p className="text-xl text-amber-200 mb-6 max-w-lg mx-auto">
                                The alien armada is approaching the Sun! Only the most dedicated explorers may enter this epic battle...
                            </p>

                            <div className="bg-space-tertiary/60 rounded-xl p-6 mb-8 border border-amber-500/30 max-w-md mx-auto">
                                <h2 className="text-lg text-amber-400 font-bold mb-4">
                                    🎮 Complete ALL games at least once to unlock
                                </h2>

                                <div className="flex justify-center gap-2 mb-4">
                                    <span className="text-2xl text-green-400">{playedCount}</span>
                                    <span className="text-2xl text-text-dim">/</span>
                                    <span className="text-2xl text-amber-400">{requiredGames.length}</span>
                                    <span className="text-text-dim ml-2">games played</span>
                                </div>

                                <div className="w-full h-4 bg-space-dark rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-amber-500 transition-all duration-500"
                                        style={{ width: `${(playedCount / requiredGames.length) * 100}%` }}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center">
                                    {gamesNeeded.slice(0, 5).map(id => {
                                        const planet = PLANETS.find(p => p.id === id);
                                        return (
                                            <Link
                                                key={id}
                                                href={`/games/${id}`}
                                                className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm hover:bg-red-500/40 transition-colors"
                                            >
                                                {planet?.name || id}
                                            </Link>
                                        );
                                    })}
                                    {gamesNeeded.length > 5 && (
                                        <span className="px-3 py-1 text-text-dim text-sm">
                                            +{gamesNeeded.length - 5} more...
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-space-tertiary hover:bg-space-secondary text-white rounded-xl transition-colors"
                            >
                                ← Return to Mission Control
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Game UI (unlocked)
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <Header />
            <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} particleCount={200} duration={5000} />

            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Game Header */}
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="font-heading text-3xl text-amber-400">
                                    ☀️ Solar Showdown: Final Boss
                                </h1>
                                <span className="px-3 py-1 bg-gradient-to-r from-amber-500/30 to-red-500/30 text-amber-400 text-sm rounded-full font-bold border border-amber-500/30">
                                    LEGENDARY
                                </span>
                            </div>
                            <p className="text-text-secondary font-ui">
                                Defend the Sun from the alien invasion! Survive 10 waves to achieve victory!
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-text-dim text-sm uppercase tracking-wider">Wave {wave}/10</p>
                            <p className={`font-heading text-xl ${lives > 2 ? 'text-green-400' : lives > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}
                            </p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <div className="game-canvas-container relative cursor-crosshair touch-none select-none">
                        <GameCanvas
                            onGameLoop={handleGameLoop}
                            width={1280}
                            height={720}
                        />

                        {/* Mobile Controls for Sun */}
                        {isPlaying && !isGameOver && !isVictory && (
                            <>
                                <div className="absolute bottom-6 left-6 z-20 md:hidden grid grid-cols-3 gap-1">
                                    <div />
                                    <button
                                        onTouchStart={(e) => { e.preventDefault(); handleTouch('w', true); }}
                                        onTouchEnd={(e) => { e.preventDefault(); handleTouch('w', false); }}
                                        className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center text-2xl select-none active:bg-white/40 backdrop-blur-sm border border-white/30"
                                    >
                                        ⬆️
                                    </button>
                                    <div />
                                    <button
                                        onTouchStart={(e) => { e.preventDefault(); handleTouch('a', true); }}
                                        onTouchEnd={(e) => { e.preventDefault(); handleTouch('a', false); }}
                                        className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center text-2xl select-none active:bg-white/40 backdrop-blur-sm border border-white/30"
                                    >
                                        ⬅️
                                    </button>
                                    <button
                                        onTouchStart={(e) => { e.preventDefault(); handleTouch('s', true); }}
                                        onTouchEnd={(e) => { e.preventDefault(); handleTouch('s', false); }}
                                        className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center text-2xl select-none active:bg-white/40 backdrop-blur-sm border border-white/30"
                                    >
                                        ⬇️
                                    </button>
                                    <button
                                        onTouchStart={(e) => { e.preventDefault(); handleTouch('d', true); }}
                                        onTouchEnd={(e) => { e.preventDefault(); handleTouch('d', false); }}
                                        className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center text-2xl select-none active:bg-white/40 backdrop-blur-sm border border-white/30"
                                    >
                                        ➡️
                                    </button>
                                </div>

                                <div className="absolute bottom-8 right-8 z-20 md:hidden">
                                    <button
                                        onTouchStart={(e) => { e.preventDefault(); handleTouch(' ', true); }}
                                        onTouchEnd={(e) => { e.preventDefault(); handleTouch(' ', false); }}
                                        className="w-20 h-20 bg-orange-500/30 rounded-full flex items-center justify-center text-4xl select-none active:bg-orange-500/50 border-2 border-orange-400 backdrop-blur-sm"
                                    >
                                        🔥
                                    </button>
                                </div>
                            </>
                        )}

                        {/* HUD Overlay */}
                        {isPlaying && !isGameOver && !isVictory && !showTrivia && (
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <p className="text-amber-400 font-bold text-xl">⭐ {score.toLocaleString()}</p>
                                </div>
                                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
                                    <p className="text-white font-bold">High: {highScore.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {/* Start Overlay */}
                        {!isPlaying && !isGameOver && !isVictory && (
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-10">
                                <div className="relative mb-4">
                                    <h2 className="font-heading text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 tracking-wider animate-pulse">
                                        SOLAR SHOWDOWN
                                    </h2>
                                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-xl -z-10" />
                                </div>

                                <p className="text-amber-300 text-xl mb-2">The Final Boss Challenge</p>
                                <p className="text-amber-200/80 mb-8 max-w-md">
                                    The alien armada approaches our Sun! Command your squadron through 10 waves of enemies to defend the heart of our solar system!
                                </p>

                                <div className="bg-amber-950/50 rounded-xl p-4 mb-6 border border-amber-600/30">
                                    <p className="text-amber-300 text-sm">
                                        <strong>Controls:</strong> Arrow Keys / WASD to move • SPACE to shoot
                                    </p>
                                </div>

                                <button
                                    onClick={startGame}
                                    className="px-10 py-4 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-amber-500/30"
                                >
                                    🚀 BEGIN BATTLE
                                </button>

                                <p className="text-text-dim text-xs mt-6">Press SPACE or click to begin</p>
                            </div>
                        )}

                        {/* Trivia Overlay */}
                        {showTrivia && triviaQuestion && (
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/98 to-orange-950/98 flex flex-col items-center justify-center p-8 text-center z-20">
                                <div className="animate-bounce mb-4">
                                    <span className="text-5xl">🧠</span>
                                </div>
                                <h3 className="font-heading text-3xl text-amber-400 mb-4">SUN TRIVIA</h3>
                                <p className="text-white text-2xl mb-8 max-w-lg">{triviaQuestion.question}</p>

                                {!triviaAnswered ? (
                                    <>
                                        <p className="text-yellow-400 mb-6 text-lg">Answer correctly for <span className="font-bold">+15⭐</span> and extra life!</p>
                                        <div className="grid grid-cols-2 gap-4 max-w-xl w-full">
                                            {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleTriviaAnswer(idx)}
                                                    className="p-5 bg-amber-800/50 hover:bg-amber-700/50 border-2 border-amber-400/40 hover:border-amber-300 rounded-xl text-white text-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-400/30"
                                                >
                                                    {answer}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="max-w-lg animate-fadeIn">
                                        <div className={`text-5xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                            {triviaCorrect ? '✅ CORRECT! +15⭐' : '❌ INCORRECT'}
                                        </div>
                                        <div className="bg-amber-900/60 p-6 rounded-xl border border-amber-400/30">
                                            <p className="text-amber-200 text-lg">
                                                💡 {triviaQuestion.fact}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Game Over */}
                        {isGameOver && (
                            <div className="absolute inset-0 bg-gradient-to-b from-red-950/95 to-slate-950/95 flex flex-col items-center justify-center p-8 text-center z-10">
                                <div className="text-6xl mb-4">💥</div>
                                <h2 className="font-heading text-5xl text-red-400 mb-4">
                                    MISSION FAILED
                                </h2>
                                <p className="text-amber-300 text-lg mb-6">The alien armada has breached our defenses...</p>

                                <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                    <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-400/30">
                                        <p className="text-3xl font-bold text-white">{wave}/10</p>
                                        <p className="text-amber-400 text-sm">Waves</p>
                                    </div>
                                    <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-400/30">
                                        <p className="text-3xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                        <p className="text-yellow-300 text-sm">Stardust</p>
                                    </div>
                                    <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-400/30">
                                        <p className="text-3xl font-bold text-orange-400">{score.toLocaleString()}</p>
                                        <p className="text-orange-300 text-sm">Score</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={startGame}
                                        className="px-10 py-4 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                    >
                                        🔄 Try Again
                                    </button>
                                    <Link href="/" className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-lg">
                                        Return to Hub
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Victory */}
                        {isVictory && (
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/95 to-slate-950/95 flex flex-col items-center justify-center p-8 text-center z-10">
                                <div className="text-6xl mb-4 animate-bounce">🏆</div>
                                <h2 className="font-heading text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400 mb-4">
                                    VICTORY!
                                </h2>
                                <p className="text-green-400 text-xl mb-2">You defended the Sun!</p>
                                <p className="text-amber-300 text-lg mb-6">The solar system is safe... for now.</p>

                                <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                    <div className="bg-green-900/30 rounded-xl p-4 border border-green-400/30">
                                        <p className="text-3xl font-bold text-green-400">10/10</p>
                                        <p className="text-green-300 text-sm">Waves Complete</p>
                                    </div>
                                    <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-400/30">
                                        <p className="text-3xl font-bold text-yellow-400">{earnedStardust}⭐</p>
                                        <p className="text-yellow-300 text-sm">Stardust</p>
                                    </div>
                                    <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-400/30">
                                        <p className="text-3xl font-bold text-amber-400">{score.toLocaleString()}</p>
                                        <p className="text-amber-300 text-sm">Final Score</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={startGame}
                                        className="px-10 py-4 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                                    >
                                        🔄 Play Again
                                    </button>
                                    <Link href="/" className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-lg">
                                        Return to Hub
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Educational Content */}
                    <section className="mt-8 space-y-12">
                        <article className="planet-card bg-gradient-to-br from-amber-900/30 to-orange-900/20">
                            <h2 className="font-heading text-3xl text-amber-400 mb-6">
                                ☀️ The Sun: Heart of Our Solar System
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    The Sun is the star at the center of our solar system, containing <strong className="text-amber-400">99.86% of the entire solar system&apos;s mass</strong>.
                                    This massive ball of hot plasma generates energy through nuclear fusion, converting about 600 million tons of hydrogen
                                    into helium every second. The energy produced in the Sun&apos;s core takes roughly 170,000 years to reach the surface,
                                    then just 8 minutes and 20 seconds to travel to Earth as sunlight.
                                </p>

                                <div className="bg-amber-900/30 p-6 rounded-lg border-l-4 border-amber-500 my-8">
                                    <p className="font-ui text-amber-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        In Solar Showdown, you defend the Sun from an alien invasion! The waves of enemies represent the constant
                                        threats our solar system faces from space debris, and your ship channels the Sun&apos;s immense power to
                                        stop them. The power-ups you collect - like Solar Flare - represent real phenomena from our star!
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl text-amber-400 mt-8 mb-4">🌡️ Incredible Temperatures</h3>
                                <p>
                                    The Sun&apos;s surface temperature is about 5,500°C (9,932°F), but the core reaches an incredible
                                    <strong className="text-orange-400"> 15 million degrees Celsius</strong>! Surprisingly, the corona
                                    (the Sun&apos;s outer atmosphere) is even hotter than the surface - a mystery scientists are still working to understand.
                                </p>

                                <h3 className="font-heading text-xl text-amber-400 mt-8 mb-4">⚡ Solar Activity</h3>
                                <p>
                                    The Sun produces solar flares and coronal mass ejections that can affect Earth&apos;s technology and create
                                    beautiful auroras. Solar wind - a stream of charged particles traveling at 400 km/s - creates the heliosphere,
                                    a protective bubble around our entire solar system.
                                </p>
                            </div>
                        </article>

                        {/* Quick Facts Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-amber-400 mb-4">📊 Sun Quick Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Diameter</span>
                                        <span className="text-amber-400">1.4 million km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Mass</span>
                                        <span className="text-amber-400">333,000× Earth</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Age</span>
                                        <span className="text-amber-400">4.6 billion years</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Core Temperature</span>
                                        <span className="text-amber-400">15 million °C</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Composition</span>
                                        <span className="text-amber-400">74% Hydrogen, 24% Helium</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-orange-400 mb-4">🔬 Solar Phenomena</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-400">☀️</span>
                                        <span><strong>Solar Flares</strong> - Explosive releases of energy</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-400">🌀</span>
                                        <span><strong>Sunspots</strong> - Cooler, darker regions on the surface</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-400">💨</span>
                                        <span><strong>Solar Wind</strong> - Stream of charged particles</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-400">👑</span>
                                        <span><strong>Corona</strong> - Outer atmosphere, 1-3 million °C</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-red-400 mb-4">🎯 Game Tips</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span>Prioritize boss aliens - they deal the most damage!</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span>Collect power-ups - Solar Flare clears the screen!</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span>Answer trivia correctly for extra lives</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span>Stay mobile - dodging is key to survival!</span>
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
