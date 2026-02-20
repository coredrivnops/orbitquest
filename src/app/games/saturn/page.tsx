'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { SaturnGameLogic } from '@/games/saturn/SaturnGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function SaturnGamePage() {
    const gameLogicRef = useRef<SaturnGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new SaturnGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    // Handle keyboard/mouse for jumping
    const handleJump = useCallback(() => {
        const game = gameLogicRef.current;
        if (game && isPlaying && !showTrivia) {
            game.jump();
        }
    }, [isPlaying, showTrivia]);

    const handleJumpRelease = useCallback(() => {
        const game = gameLogicRef.current;
        if (game) {
            game.releaseJump();
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                handleJump();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                handleJumpRelease();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleJump, handleJumpRelease]);

    const handleGameLoop = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying && !showTrivia) {
            game.update();
        }
        game.draw(ctx);

        if (frameCount % 10 === 0) {
            setScore(game.score);
            setLevel(game.level);

            // Check for trivia trigger
            if (game.showTrivia && !showTrivia && game.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(game.currentTrivia);
                setTriviaAnswered(false);
            }

            if (game.isGameOver && !isGameOver) {
                handleGameOver(game.score, game.stardustCollected);
            }
        }
    };

    const handleGameOver = (finalScore: number, stardust: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setShowTrivia(false);

        addStardust(stardust);
        updateHighScore('saturn', finalScore);
        markGamePlayed('saturn');

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
        setLevel(1);
        setEarnedStardust(0);
    };

    // FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What are Saturn's rings made of?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Saturn's rings are made of billions of particles of ice and rock, ranging from tiny grains to chunks the size of houses. The rings are surprisingly thin—only about 10 meters thick in most places, despite spanning 282,000 kilometers in diameter."
                }
            },
            {
                "@type": "Question",
                "name": "Could Saturn float on water?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Saturn is the least dense planet in our solar system, with a density of only 0.687 g/cm³—less than water (1 g/cm³). If you had a bathtub big enough, Saturn would actually float!"
                }
            },
            {
                "@type": "Question",
                "name": "How many moons does Saturn have?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "As of 2023, Saturn has at least 146 confirmed moons, the most of any planet in our solar system. The largest, Titan, is bigger than Mercury and has its own thick atmosphere with lakes of liquid methane."
                }
            },
            {
                "@type": "Question",
                "name": "What is the hexagonal storm on Saturn?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Saturn's north pole features a bizarre hexagonal storm pattern that has been spinning for at least 40 years. Each side of the hexagon is about 14,500 kilometers long—larger than Earth's diameter! Scientists believe it's caused by differences in wind speeds at different latitudes."
                }
            },
            {
                "@type": "Question",
                "name": "How long is a day on Saturn?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A day on Saturn is only 10.7 hours, making it the second shortest day in our solar system (after Jupiter). Despite its massive size, Saturn spins incredibly fast, which causes it to bulge at the equator."
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
                            <h1 className="font-heading text-3xl" style={{ color: '#fbbf24' }}>Saturn: Ring Runner</h1>
                            <p className="text-text-secondary font-ui">
                                Jump across Saturn&apos;s famous rings! Low gravity means big, floaty jumps.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-text-dim text-sm uppercase tracking-wider">Level {level}</p>
                            <p className="font-heading text-2xl" style={{ color: '#fbbf24' }}>{score.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <PlanetGuard planetId="saturn">
                        <div
                            className="game-canvas-container relative touch-none cursor-pointer"
                            onMouseDown={handleJump}
                            onMouseUp={handleJumpRelease}
                            onTouchStart={handleJump}
                            onTouchEnd={handleJumpRelease}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* Start Overlay */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <h2 className="font-heading text-4xl mb-2 glow-text" style={{ color: '#fbbf24' }}>
                                        🪐 RING RUNNER
                                    </h2>
                                    <p className="text-yellow-400 text-lg mb-6">Jump across Saturn&apos;s legendary rings!</p>

                                    <div className="max-w-xl mb-8 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                                                <p className="text-2xl mb-1">🖱️ / ⌨️</p>
                                                <p className="font-bold text-yellow-400">
                                                    <span className="md:hidden">TAP or </span>CLICK<span className="hidden md:inline"> or SPACE</span>
                                                </p>
                                                <p className="text-sm text-text-dim">to jump</p>
                                            </div>
                                            <div className="p-4 rounded-lg" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                                                <p className="text-2xl mb-1">⬆️</p>
                                                <p className="font-bold text-yellow-400">HOLD LONGER</p>
                                                <p className="text-sm text-text-dim">for higher jumps</p>
                                            </div>
                                        </div>
                                        <p className="text-text-secondary">
                                            Land on ring platforms. Avoid falling into space!
                                        </p>
                                        <p className="text-blue-300 text-sm">
                                            🧊 Blue platforms are slippery ice | ⚠️ Brown platforms crumble!
                                        </p>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="px-12 py-4 text-xl font-bold rounded border-2 transition-all hover:scale-105 animate-pulse"
                                        style={{ borderColor: '#fbbf24', color: '#fbbf24' }}
                                    >
                                        🚀 Start Running
                                    </button>
                                </div>
                            )}

                            {/* Trivia Overlay */}
                            {showTrivia && triviaQuestion && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20" style={{ background: 'rgba(30, 15, 5, 0.97)' }}>
                                    <h3 className="font-heading text-2xl mb-2" style={{ color: '#fbbf24' }}>🪐 SATURN TRIVIA</h3>
                                    <p className="text-white text-xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                    {!triviaAnswered ? (
                                        <>
                                            <p className="text-yellow-400 mb-4">Answer correctly for +25⭐ bonus!</p>
                                            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                                {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleTriviaAnswer(idx)}
                                                        className="p-4 hover:bg-yellow-900/50 border rounded-lg text-white transition-all hover:scale-105"
                                                        style={{ background: 'rgba(139, 115, 85, 0.3)', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                                                    >
                                                        {answer}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="max-w-lg">
                                            <p className={`text-3xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {triviaCorrect ? '✅ CORRECT! +25⭐' : '❌ WRONG!'}
                                            </p>
                                            <p className="text-yellow-200 text-sm p-4 rounded-lg" style={{ background: 'rgba(139, 115, 85, 0.4)' }}>
                                                💡 {triviaQuestion.fact}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Game Over */}
                            {isGameOver && (
                                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <h2 className="font-heading text-4xl text-red-400 mb-4">Lost in the Rings</h2>
                                    <p className="text-xl text-white mb-1">Reached Level {level}</p>
                                    <p className="text-2xl text-white mb-2">Score: {score.toLocaleString()}</p>
                                    <p className="text-xl mb-8" style={{ color: '#ffd700' }}>+{earnedStardust} Stardust Earned</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="px-8 py-3 font-bold rounded border-2 transition-all hover:scale-105"
                                            style={{ borderColor: '#fbbf24', color: '#fbbf24' }}
                                        >
                                            Run Again
                                        </button>
                                        <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
                                            Return to Hub
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </PlanetGuard>

                    {/* Educational Content */}
                    <section className="mt-8 space-y-12">

                        {/* Main Article */}
                        <article className="planet-card">
                            <h2 className="font-heading text-3xl mb-6" style={{ color: '#fbbf24' }}>
                                Saturn: The Jewel of Our Solar System
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    Saturn, the sixth planet from the Sun, is often called the most beautiful planet in
                                    our solar system. Its magnificent ring system, visible even with a small telescope
                                    from Earth, has captivated astronomers for over 400 years since Galileo first
                                    observed them in 1610.
                                </p>

                                <h3 className="font-heading text-xl mt-8 mb-4" style={{ color: '#d97706' }}>The Magnificent Rings</h3>
                                <p>
                                    Saturn&apos;s rings are made of billions of particles—chunks of ice and rock ranging
                                    from tiny grains to pieces the size of houses. Despite spanning 282,000 kilometers
                                    in diameter, the rings are remarkably thin, averaging just 10 meters in thickness.
                                    If you could shrink Saturn to the size of a basketball, its rings would be thinner
                                    than a sheet of paper.
                                </p>
                                <p>
                                    The rings are divided into seven main sections (A through G), separated by gaps
                                    like the Cassini Division. These gaps are caused by the gravitational influence
                                    of Saturn&apos;s moons, which clear out ring material like cosmic vacuum cleaners.
                                </p>

                                <div className="p-6 rounded-lg border-l-4 my-8" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: '#fbbf24' }}>
                                    <p className="font-ui font-bold mb-2" style={{ color: '#fbbf24' }}>🎮 GAME CONNECTION</p>
                                    <p>
                                        In Ring Runner, you jump across segments of Saturn&apos;s rings, experiencing
                                        the planet&apos;s lower gravity with big, floaty jumps. The icy platforms
                                        represent the frozen particles that make up the actual rings, while the
                                        gaps mirror the divisions carved by Saturn&apos;s many moons!
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl mt-8 mb-4" style={{ color: '#d97706' }}>A World of Gas</h3>
                                <p>
                                    Like Jupiter, Saturn is a gas giant with no solid surface. If you tried to land
                                    on Saturn, you would simply sink through layers of increasingly dense hydrogen
                                    and helium gas. The planet&apos;s famous pale yellow color comes from ammonia
                                    crystals in its upper atmosphere.
                                </p>
                                <p>
                                    Saturn is the least dense planet in our solar system—only 0.687 grams per cubic
                                    centimeter, less than water. This means that if you could find a bathtub large
                                    enough, Saturn would actually float!
                                </p>

                                <h3 className="font-heading text-xl mt-8 mb-4" style={{ color: '#d97706' }}>The Hexagonal Mystery</h3>
                                <p>
                                    One of Saturn&apos;s strangest features is the hexagonal storm at its north pole.
                                    This six-sided weather pattern is about 30,000 kilometers across—large enough to
                                    fit four Earths inside. Scientists believe the hexagon is caused by differences
                                    in wind speeds at different latitudes, creating standing wave patterns in the
                                    atmosphere. The storm has been raging for at least 40 years.
                                </p>
                            </div>
                        </article>

                        {/* Quick Facts Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl mb-4" style={{ color: '#fbbf24' }}>📊 Saturn Quick Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Distance from Sun</span>
                                        <span style={{ color: '#fbbf24' }}>1.4 billion km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbital Period</span>
                                        <span style={{ color: '#fbbf24' }}>29.4 Earth years</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Day Length</span>
                                        <span style={{ color: '#fbbf24' }}>10.7 hours</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Diameter</span>
                                        <span style={{ color: '#fbbf24' }}>116,460 km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Moons</span>
                                        <span style={{ color: '#fbbf24' }}>146+ known</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Rings</span>
                                        <span style={{ color: '#fbbf24' }}>7 main rings</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Density</span>
                                        <span style={{ color: '#fbbf24' }}>0.687 g/cm³</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl mb-4" style={{ color: '#d97706' }}>🌙 Saturn&apos;s Major Moons</h3>
                                <div className="space-y-4 text-sm text-text-secondary">
                                    <div>
                                        <p className="font-bold text-white">Titan (Largest)</p>
                                        <p>Bigger than Mercury with a thick atmosphere and lakes of liquid methane.
                                            The only moon with a dense atmosphere.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Enceladus</p>
                                        <p>Has geysers shooting water ice into space! May harbor an underground
                                            ocean that could support life.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Mimas</p>
                                        <p>Looks like the Death Star from Star Wars due to its massive impact crater.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="planet-card" style={{ background: 'linear-gradient(to bottom right, rgba(251, 191, 36, 0.1), rgba(15, 23, 42, 0.5))' }}>
                                <h3 className="font-heading text-xl mb-4" style={{ color: '#fbbf24' }}>💡 Did You Know?</h3>
                                <div className="space-y-4 text-sm text-text-dim">
                                    <p className="italic">
                                        &quot;Saturn&apos;s rings are disappearing! They&apos;re slowly raining down onto
                                        the planet and will be completely gone in about 300 million years.&quot;
                                    </p>
                                    <p className="italic">
                                        &quot;Saturn has been visited by only four spacecraft: Pioneer 11, Voyager 1,
                                        Voyager 2, and the Cassini mission which orbited Saturn for 13 years.&quot;
                                    </p>
                                    <p className="italic">
                                        &quot;Winds on Saturn can reach up to 1,800 km/h at the equator—five times
                                        faster than the strongest hurricanes on Earth.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Exploration History */}
                        <article className="planet-card">
                            <h2 className="font-heading text-2xl mb-6" style={{ color: '#fbbf24' }}>
                                Cassini-Huygens: Saturn&apos;s Greatest Explorer
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary">
                                <p>
                                    The Cassini-Huygens mission, launched in 1997, revolutionized our understanding
                                    of Saturn. After arriving in 2004, the Cassini spacecraft spent 13 years studying
                                    the planet, its rings, and its moons in unprecedented detail.
                                </p>
                                <p className="mt-4">
                                    The Huygens probe, carried by Cassini, made history in 2005 by landing on Titan—the
                                    first landing ever achieved in the outer solar system. It transmitted data for
                                    72 minutes from Titan&apos;s surface, revealing a world with lakes, rivers, and
                                    weather patterns similar to Earth, but with liquid methane instead of water.
                                </p>
                                <p className="mt-4">
                                    In September 2017, with its fuel running low, Cassini was deliberately plunged
                                    into Saturn&apos;s atmosphere in a &quot;Grand Finale&quot; maneuver. This protected
                                    the potentially life-harboring moons Titan and Enceladus from contamination while
                                    sending back unprecedented data about Saturn&apos;s atmosphere until the very end.
                                </p>
                            </div>
                        </article>

                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}

