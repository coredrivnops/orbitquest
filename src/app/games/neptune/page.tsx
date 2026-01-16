'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import { NeptuneGameLogic } from '@/games/neptune/NeptuneGameLogic';
import { addStardust, updateHighScore } from '@/lib/localStorage';
import Link from 'next/link';

export default function NeptuneGamePage() {
    const gameLogicRef = useRef<NeptuneGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new NeptuneGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

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
        updateHighScore('neptune', finalScore);

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

    const handleInput = (e: React.MouseEvent | React.TouchEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying || showTrivia) return;

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
        setShowTrivia(false);
        setScore(0);
        setLevel(1);
        setEarnedStardust(0);
    };

    // Rich FAQ Schema for SEO
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Why is Neptune blue?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Neptune appears brilliant blue because methane in its atmosphere absorbs red light from the Sun and reflects blue light back into space. The planet's vivid azure hue is more intense than Uranus due to an unknown atmospheric component that scientists are still investigating."
                }
            },
            {
                "@type": "Question",
                "name": "How fast are Neptune's winds?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Neptune has the fastest winds in the solar system, reaching speeds up to 2,000 km/h (1,200 mph) - faster than the speed of sound on Earth! These supersonic winds are powered by the planet's internal heat rather than solar energy."
                }
            },
            {
                "@type": "Question",
                "name": "How was Neptune discovered?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Neptune was the first planet discovered through mathematical prediction rather than observation. In 1846, astronomers Johann Galle and Heinrich d'Arrest found Neptune exactly where mathematicians Urbain Le Verrier and John Couch Adams had predicted, based on irregularities in Uranus's orbit."
                }
            },
            {
                "@type": "Question",
                "name": "What happened to Neptune's Great Dark Spot?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Unlike Jupiter's persistent Great Red Spot, Neptune's Great Dark Spot (discovered by Voyager 2 in 1989) had completely disappeared by 1994 when the Hubble Space Telescope looked for it. This demonstrates that Neptune has a more dynamic and changeable atmosphere than previously thought."
                }
            },
            {
                "@type": "Question",
                "name": "Is Neptune a gas giant or ice giant?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Neptune is classified as an 'ice giant' rather than a gas giant. While it has a hydrogen-helium atmosphere like Jupiter and Saturn, its interior is primarily composed of water, methane, and ammonia in icy or supercritical fluid states, unlike the metallic hydrogen cores of true gas giants."
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
                            <h1 className="font-heading text-3xl text-neon-cyan">Neptune: Deep Dive</h1>
                            <p className="text-text-secondary font-ui">
                                Navigate supersonic winds. Collect stardust. Answer trivia to earn bonus rewards!
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-text-dim text-sm uppercase tracking-wider">Level {level}</p>
                            <p className="font-heading text-2xl text-neon-purple">{score.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <div
                        className="game-canvas-container relative cursor-crosshair touch-none"
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
                        {!isPlaying && !isGameOver && (
                            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-8 text-center z-10">
                                <h2 className="font-heading text-4xl text-neon-cyan mb-2 glow-text">
                                    🌊 DEEP DIVE
                                </h2>
                                <p className="text-blue-400 text-lg mb-6">Descend into Neptune&apos;s supersonic atmosphere</p>

                                <div className="max-w-xl mb-8 space-y-4">
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div className="p-3 bg-blue-900/30 rounded-lg">
                                            <p className="text-2xl mb-1">🎮</p>
                                            <p className="text-neon-cyan font-bold">STEER</p>
                                            <p className="text-text-dim">Move mouse/finger</p>
                                        </div>
                                        <div className="p-3 bg-blue-900/30 rounded-lg">
                                            <p className="text-2xl mb-1">💎</p>
                                            <p className="text-yellow-400 font-bold">COLLECT</p>
                                            <p className="text-text-dim">Grab stardust</p>
                                        </div>
                                        <div className="p-3 bg-blue-900/30 rounded-lg">
                                            <p className="text-2xl mb-1">🧠</p>
                                            <p className="text-purple-400 font-bold">TRIVIA</p>
                                            <p className="text-text-dim">Answer for +25⭐</p>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary">
                                        Avoid ice crystals and storm clouds. Build combos by collecting quickly!
                                    </p>
                                </div>

                                <button
                                    onClick={startGame}
                                    className="btn-neon text-xl px-12 py-4 animate-pulse-glow"
                                >
                                    🚀 Begin Descent
                                </button>
                            </div>
                        )}

                        {/* Trivia Overlay */}
                        {showTrivia && triviaQuestion && (
                            <div className="absolute inset-0 bg-blue-950/95 flex flex-col items-center justify-center p-8 text-center z-20">
                                <h3 className="font-heading text-2xl text-neon-cyan mb-2">🧠 NEPTUNE TRIVIA</h3>
                                <p className="text-white text-xl mb-6 max-w-lg">{triviaQuestion.question}</p>

                                {!triviaAnswered ? (
                                    <>
                                        <p className="text-yellow-400 mb-4">Answer correctly for +25⭐ bonus!</p>
                                        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                            {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleTriviaAnswer(idx)}
                                                    className="p-4 bg-blue-800/50 hover:bg-blue-700/50 border border-blue-400/30 rounded-lg text-white transition-all hover:scale-105"
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
                                        <p className="text-blue-200 text-sm bg-blue-900/50 p-4 rounded-lg">
                                            💡 {triviaQuestion.fact}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Game Over */}
                        {isGameOver && (
                            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-8 text-center z-10">
                                <h2 className="font-heading text-4xl text-red-400 mb-4">
                                    Hull Breach
                                </h2>
                                <p className="text-xl text-white mb-1">Reached Level {level}</p>
                                <p className="text-2xl text-white mb-2">Score: {score.toLocaleString()}</p>
                                <p className="text-xl text-yellow-400 mb-8">+{earnedStardust} Stardust Earned</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={startGame}
                                        className="btn-neon px-8 py-3"
                                    >
                                        Dive Again
                                    </button>
                                    <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
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

                    {/* Educational Content - Extensive for AdSense */}
                    <section className="mt-8 space-y-12">

                        {/* Main Article */}
                        <article className="planet-card">
                            <h2 className="font-heading text-3xl text-neon-cyan mb-6">
                                Neptune: The Windiest World in Our Solar System
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    Neptune, the eighth and farthest known planet from the Sun, is a world of extremes.
                                    Despite receiving less than 1/900th of the sunlight that reaches Earth, this ice giant
                                    generates some of the most violent weather phenomena in our solar system. Its supersonic
                                    winds, reaching speeds of 2,000 kilometers per hour, make Earth&apos;s most powerful
                                    hurricanes seem like gentle breezes in comparison.
                                </p>

                                <h3 className="font-heading text-xl text-neon-purple mt-8 mb-4">A Planet of Mystery</h3>
                                <p>
                                    Neptune was discovered in 1846, making it unique among planets—it was found through
                                    mathematical prediction rather than direct observation. French mathematician Urbain Le Verrier
                                    and British mathematician John Couch Adams independently calculated that an unknown planet
                                    must exist based on irregularities in Uranus&apos;s orbit. When German astronomer Johann Galle
                                    pointed his telescope at the predicted location, Neptune was exactly where the math said it
                                    would be. This remarkable fusion of mathematics and astronomy remains one of the greatest
                                    triumphs in the history of science.
                                </p>

                                <h3 className="font-heading text-xl text-neon-purple mt-8 mb-4">The Blue Giant</h3>
                                <p>
                                    Neptune&apos;s striking blue color comes from methane in its atmosphere, which absorbs
                                    red wavelengths of light and reflects blue. But Neptune is bluer than Uranus, despite
                                    having a similar methane concentration. Scientists believe an unknown compound in
                                    Neptune&apos;s atmosphere contributes to its more vivid azure hue—a mystery that
                                    remains unsolved to this day.
                                </p>

                                <div className="bg-space-dark p-6 rounded-lg border-l-4 border-neon-cyan my-8">
                                    <p className="font-ui text-neon-cyan font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        In Deep Dive, you navigate through Neptune&apos;s atmosphere, experiencing
                                        the supersonic wind zones that push your probe sideways. The ice crystals
                                        you dodge are inspired by the frozen methane and ammonia particles that
                                        exist in Neptune&apos;s upper atmosphere. Every few levels, test your
                                        Neptune knowledge with trivia questions to earn bonus stardust!
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl text-neon-purple mt-8 mb-4">Disappearing Storms</h3>
                                <p>
                                    When Voyager 2 flew by Neptune in 1989, it captured images of a massive storm
                                    called the Great Dark Spot—similar in relative size to Jupiter&apos;s Great Red Spot.
                                    Scientists expected this storm to be a permanent feature. However, when the
                                    Hubble Space Telescope observed Neptune in 1994, the Great Dark Spot had
                                    completely vanished. New dark spots have appeared and disappeared since then,
                                    revealing Neptune as one of the most dynamic and changeable worlds in our solar system.
                                </p>

                                <h3 className="font-heading text-xl text-neon-purple mt-8 mb-4">Ice Giant Classification</h3>
                                <p>
                                    Although Neptune is often grouped with Jupiter and Saturn as a &quot;gas giant,&quot;
                                    astronomers now classify it differently. Neptune and Uranus are &quot;ice giants&quot;—their
                                    interiors are dominated by water, methane, and ammonia compounds in hot, dense fluid
                                    states, rather than the metallic hydrogen found in true gas giants. At Neptune&apos;s
                                    core, the pressure is so extreme that these substances may exist in exotic states
                                    not found anywhere on Earth.
                                </p>
                            </div>
                        </article>

                        {/* Quick Facts Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-neon-cyan mb-4">📊 Neptune Quick Facts</h3>
                                <ul className="space-y-3 text-sm text-text-secondary">
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Distance from Sun</span>
                                        <span className="text-neon-cyan">4.5 billion km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Orbital Period</span>
                                        <span className="text-neon-cyan">165 Earth years</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Day Length</span>
                                        <span className="text-neon-cyan">16 hours</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Diameter</span>
                                        <span className="text-neon-cyan">49,528 km</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Moons</span>
                                        <span className="text-neon-cyan">16 known</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Rings</span>
                                        <span className="text-neon-cyan">5 main rings</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Wind Speed</span>
                                        <span className="text-neon-cyan">2,000 km/h</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-neon-purple mb-4">🌙 Neptune&apos;s Moons</h3>
                                <div className="space-y-4 text-sm text-text-secondary">
                                    <div>
                                        <p className="font-bold text-white">Triton (Largest)</p>
                                        <p>The only large moon in the solar system that orbits retrograde
                                            (opposite to its planet&apos;s rotation). Scientists believe Triton
                                            was captured from the Kuiper Belt.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Nereid</p>
                                        <p>Has one of the most eccentric orbits of any moon, ranging from
                                            1.4 million to 9.6 million km from Neptune.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Proteus</p>
                                        <p>Neptune&apos;s second-largest moon, irregularly shaped because
                                            it&apos;s not massive enough for gravity to pull it into a sphere.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="planet-card bg-gradient-to-br from-blue-900/30 to-space-tertiary">
                                <h3 className="font-heading text-xl text-blue-400 mb-4">💡 Did You Know?</h3>
                                <div className="space-y-4 text-sm text-text-dim">
                                    <p className="italic">
                                        &quot;Neptune is so far from the Sun that noon on Neptune is like deep
                                        twilight on Earth. Yet despite this distant darkness, powerful storms
                                        still rage across its surface.&quot;
                                    </p>
                                    <p className="italic">
                                        &quot;It rains diamonds on Neptune! The extreme pressure turns methane
                                        into diamond crystals that sink toward the core.&quot;
                                    </p>
                                    <p className="italic">
                                        &quot;Neptune has completed only one orbit around the Sun since its
                                        discovery in 1846—it won&apos;t complete another until 2011... wait,
                                        it actually finished its first orbit in 2011!&quot;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Exploration History */}
                        <article className="planet-card">
                            <h2 className="font-heading text-2xl text-neon-cyan mb-6">
                                Exploration History: Voyager 2&apos;s Grand Finale
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary">
                                <p>
                                    The only spacecraft to ever visit Neptune was NASA&apos;s Voyager 2, which made
                                    its closest approach on August 25, 1989. This flyby was the culmination of
                                    the &quot;Grand Tour&quot;—a rare planetary alignment that allowed a single spacecraft
                                    to visit Jupiter, Saturn, Uranus, and Neptune using gravity assists.
                                </p>
                                <p className="mt-4">
                                    During its encounter, Voyager 2 discovered six new moons, four rings, and
                                    captured stunning images of the Great Dark Spot. It detected Neptune&apos;s
                                    magnetic field, measured the planet&apos;s rotation period, and provided data
                                    that scientists are still analyzing decades later. After Neptune, Voyager 2
                                    continued into interstellar space, where it remains the most distant human-made
                                    object from Earth after its twin, Voyager 1.
                                </p>
                                <p className="mt-4">
                                    As of now, no new missions to Neptune are scheduled, though scientists have
                                    proposed various concepts including orbiters and atmospheric probes. The
                                    extreme distance—it took Voyager 2 twelve years to reach Neptune—makes
                                    any mission a multi-decade commitment.
                                </p>
                            </div>
                        </article>

                    </section>

                    {/* Ad Slot */}
                    <div className="my-8 h-[250px] bg-space-tertiary/30 rounded-lg border border-white/5 flex items-center justify-center">
                        <span className="text-text-dim text-sm opacity-50">Advertisement</span>
                    </div>

                </div>
            </main>

            <Footer />
        </>
    );
}
