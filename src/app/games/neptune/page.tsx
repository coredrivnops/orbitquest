'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameCanvas from '@/components/GameCanvas';
import PlanetGuard from '@/components/PlanetGuard';
import { NeptuneGameLogic } from '@/games/neptune/NeptuneGameLogic';
import { addStardust, updateHighScore, markGamePlayed } from '@/lib/localStorage';
import Link from 'next/link';

export default function NeptuneGamePage() {
    const gameLogicRef = useRef<NeptuneGameLogic | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [earnedStardust, setEarnedStardust] = useState(0);
    const [diamondsCollected, setDiamondsCollected] = useState(0);
    const [machNumber, setMachNumber] = useState(0);
    const [isSuperSonic, setIsSuperSonic] = useState(false);
    const [combo, setCombo] = useState(1);

    // Trivia state
    const [showTrivia, setShowTrivia] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triviaQuestion, setTriviaQuestion] = useState<any>(null);
    const [triviaAnswered, setTriviaAnswered] = useState(false);
    const [triviaCorrect, setTriviaCorrect] = useState(false);

    useEffect(() => {
        gameLogicRef.current = new NeptuneGameLogic(1280, 720);
        return () => {
            gameLogicRef.current = null;
        };
    }, []);

    const handleGameLoop = useCallback((ctx: CanvasRenderingContext2D, frameCount: number, deltaTime: number) => {
        const game = gameLogicRef.current;
        if (!game) return;

        if (isPlaying && !showTrivia) {
            game.update(deltaTime);
        }
        game.draw(ctx);

        if (frameCount % 6 === 0) {
            const state = game.getState();
            setScore(state.score);
            setDistance(state.distance);
            setDiamondsCollected(state.diamondsCollected);
            setMachNumber(state.machNumber);
            setIsSuperSonic(state.isSuperSonic);
            setCombo(state.combo);

            // Check for trivia trigger
            if (state.showTrivia && !showTrivia && state.currentTrivia) {
                setShowTrivia(true);
                setTriviaQuestion(state.currentTrivia);
                setTriviaAnswered(false);
            }

            if (state.isGameOver && !isGameOver) {
                handleGameOver(state.score, state.stardustCollected);
            }
        }
    }, [isPlaying, showTrivia, isGameOver]);

    const handleGameOver = (finalScore: number, stardust: number) => {
        setIsGameOver(true);
        setEarnedStardust(stardust);
        setShowTrivia(false);

        addStardust(stardust);
        updateHighScore('neptune', finalScore);
        markGamePlayed('neptune');

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
        if (!game || !isPlaying || showTrivia) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleY = game.height / rect.height;
        const y = (e.clientY - rect.top) * scaleY;

        game.handleMouseMove(y);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const game = gameLogicRef.current;
        if (!game || !isPlaying || showTrivia) return;
        if (e.touches.length === 0) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleY = game.height / rect.height;
        const y = (e.touches[0].clientY - rect.top) * scaleY;

        game.handleMouseMove(y);
    };

    const startGame = () => {
        if (gameLogicRef.current) {
            gameLogicRef.current.reset();
        }
        setIsPlaying(true);
        setIsGameOver(false);
        setShowTrivia(false);
        setScore(0);
        setDistance(0);
        setEarnedStardust(0);
        setDiamondsCollected(0);
        setMachNumber(0);
        setIsSuperSonic(false);
        setCombo(1);
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
                "name": "Does it really rain diamonds on Neptune?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Scientists believe it literally rains diamonds on Neptune! The extreme pressure in Neptune's atmosphere converts methane into diamond crystals that sink toward the planet's core. This 'diamond rain' has been replicated in laboratory experiments."
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
                "name": "What is special about Neptune's moon Triton?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Triton is the only large moon in our solar system that orbits its planet backwards (retrograde). Scientists believe Triton was originally a Kuiper Belt object that was captured by Neptune's gravity. It also has active geysers that shoot nitrogen gas into space!"
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
                            <h1 className="font-heading text-3xl text-neon-cyan">
                                Neptune: Mach Surfer
                                <span className="ml-2 text-lg">🔊💎🌊</span>
                            </h1>
                            <p className="text-text-secondary font-ui">
                                Surf Neptune&apos;s supersonic winds at Mach speed! Collect diamond rain!
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold uppercase tracking-wider ${isSuperSonic ? 'text-cyan-400 animate-pulse' : 'text-text-dim'}`}>
                                {isSuperSonic ? '🔊 SUPERSONIC!' : `Mach ${machNumber.toFixed(2)}`}
                            </p>
                            <p className="font-heading text-2xl text-white">{Math.floor(distance / 10).toLocaleString()}km</p>
                        </div>
                    </div>

                    {/* Game Container */}
                    <PlanetGuard planetId="neptune">
                        <div
                            className="game-canvas-container relative cursor-crosshair touch-none"
                            onMouseMove={handleMouseMove}
                            onTouchMove={handleTouchMove}
                            onTouchStart={handleTouchMove}
                        >
                            <GameCanvas
                                onGameLoop={handleGameLoop}
                                width={1280}
                                height={720}
                            />

                            {/* HUD Overlay */}
                            {isPlaying && !isGameOver && !showTrivia && (
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                    <div className="space-y-2">
                                        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2">
                                            <p className="text-white font-bold">💎 {diamondsCollected}</p>
                                        </div>
                                        {combo > 1 && (
                                            <div className="bg-purple-900/60 backdrop-blur-sm rounded-lg px-4 py-2 animate-pulse">
                                                <p className="text-purple-300 font-bold">🔥 x{combo} COMBO</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-sm rounded-lg px-6 py-2 text-right">
                                        <p className="text-cyan-400 font-bold text-xl">{score.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            {/* Start Overlay */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/95 via-blue-900/95 to-cyan-950/95 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <h2 className="font-heading text-5xl text-cyan-400 mb-2 glow-text">
                                        🌊 MACH SURFER
                                    </h2>
                                    <p className="text-blue-300 text-xl mb-8">Race through Neptune&apos;s supersonic atmosphere!</p>

                                    <div className="max-w-2xl mb-8 space-y-6">
                                        {/* Speed facts */}
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="p-4 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                                                <p className="text-3xl mb-1">🔊</p>
                                                <p className="text-cyan-400 font-bold">BREAK MACH 1</p>
                                                <p className="text-text-dim text-sm">Go supersonic for bonus!</p>
                                            </div>
                                            <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                                                <p className="text-3xl mb-1">💨</p>
                                                <p className="text-green-400 font-bold">RIDE WIND</p>
                                                <p className="text-text-dim text-sm">Green currents = speed!</p>
                                            </div>
                                            <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                                                <p className="text-3xl mb-1">💎</p>
                                                <p className="text-purple-400 font-bold">DIAMOND RAIN</p>
                                                <p className="text-text-dim text-sm">It really rains diamonds!</p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-400/20">
                                            <p className="text-yellow-400 font-bold mb-2">🎮 HOW TO PLAY</p>
                                            <p className="text-text-secondary">
                                                Move mouse or drag <span className="text-cyan-400 font-bold">UP/DOWN</span> to navigate •
                                                Ride <span className="text-green-400 font-bold">green wind currents</span> for speed •
                                                Avoid <span className="text-red-400 font-bold">red headwinds</span> and ice! •
                                                Collect <span className="text-white font-bold">diamonds</span> for stardust!
                                            </p>
                                        </div>

                                        <div className="bg-indigo-900/30 p-3 rounded-lg text-sm">
                                            <p className="text-indigo-300">
                                                💡 <strong>Real Science:</strong> Neptune has the fastest winds in the solar system at 2,000 km/h,
                                                and scientists believe it literally rains diamonds there!
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="btn-neon text-xl px-12 py-4 animate-pulse-glow"
                                    >
                                        🚀 LAUNCH PROBE
                                    </button>
                                </div>
                            )}

                            {/* Trivia Overlay */}
                            {showTrivia && triviaQuestion && (
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/98 to-blue-950/98 flex flex-col items-center justify-center p-8 text-center z-20">
                                    <div className="animate-bounce mb-4">
                                        <span className="text-5xl">🧠</span>
                                    </div>
                                    <h3 className="font-heading text-3xl text-cyan-400 mb-4">NEPTUNE TRIVIA</h3>
                                    <p className="text-white text-2xl mb-8 max-w-lg">{triviaQuestion.question}</p>

                                    {!triviaAnswered ? (
                                        <>
                                            <p className="text-yellow-400 mb-6 text-lg">Answer correctly for <span className="font-bold">+10⭐</span> and speed boost!</p>
                                            <div className="grid grid-cols-2 gap-4 max-w-xl w-full">
                                                {triviaQuestion.answers.map((answer: string, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleTriviaAnswer(idx)}
                                                        className="p-5 bg-blue-800/50 hover:bg-cyan-700/50 border-2 border-cyan-400/40 hover:border-cyan-300 rounded-xl text-white text-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/30"
                                                    >
                                                        {answer}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="max-w-lg animate-fadeIn">
                                            <div className={`text-5xl font-bold mb-4 ${triviaCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {triviaCorrect ? '✅ CORRECT! +10⭐' : '❌ INCORRECT'}
                                            </div>
                                            <div className="bg-blue-900/60 p-6 rounded-xl border border-blue-400/30">
                                                <p className="text-blue-200 text-lg">
                                                    💡 {triviaQuestion.fact}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Game Over */}
                            {isGameOver && (
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/95 to-slate-950/95 flex flex-col items-center justify-center p-8 text-center z-10">
                                    <div className="text-6xl mb-4">💥</div>
                                    <h2 className="font-heading text-5xl text-red-400 mb-4">
                                        COLLISION!
                                    </h2>
                                    <p className="text-blue-300 text-lg mb-6">Your probe hit an ice crystal in Neptune&apos;s atmosphere</p>

                                    <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                        <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-400/30">
                                            <p className="text-3xl font-bold text-white">{Math.floor(distance / 10).toLocaleString()}km</p>
                                            <p className="text-blue-400 text-sm">Distance</p>
                                        </div>
                                        <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-400/30">
                                            <p className="text-3xl font-bold text-yellow-400">💎 {diamondsCollected}</p>
                                            <p className="text-purple-400 text-sm">Diamonds</p>
                                        </div>
                                        <div className="bg-cyan-900/30 rounded-xl p-4 border border-cyan-400/30">
                                            <p className="text-3xl font-bold text-cyan-400">{score.toLocaleString()}</p>
                                            <p className="text-cyan-300 text-sm">Score</p>
                                        </div>
                                    </div>

                                    <p className="text-2xl text-yellow-400 mb-8 font-bold">⭐ +{earnedStardust} Stardust Earned</p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="btn-neon px-10 py-4 text-lg"
                                        >
                                            🚀 Surf Again
                                        </button>
                                        <Link href="/" className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-lg">
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
                            <h2 className="font-heading text-3xl text-neon-cyan mb-6">
                                🌊 Neptune: The Windiest World with Diamond Rain
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    Neptune, the eighth and farthest known planet from the Sun, is a world of extremes.
                                    Despite receiving less than 1/900th of the sunlight that reaches Earth, this ice giant
                                    generates some of the most violent weather phenomena in our solar system. Its supersonic
                                    winds, reaching speeds of <strong className="text-cyan-400">2,000 kilometers per hour</strong>, make Earth&apos;s most powerful
                                    hurricanes seem like gentle breezes in comparison.
                                </p>

                                <h3 className="font-heading text-xl text-neon-purple mt-8 mb-4">💎 Diamond Rain - It&apos;s Real!</h3>
                                <p>
                                    One of Neptune&apos;s most astonishing features is that it literally <strong className="text-purple-400">rains diamonds</strong>!
                                    Deep within Neptune&apos;s atmosphere, extreme pressure and temperature squeeze methane molecules
                                    so intensely that they break apart, releasing carbon atoms that compress into diamond crystals.
                                    These diamonds then sink toward the planet&apos;s core like glittering rain. Scientists have
                                    successfully recreated this phenomenon in laboratory experiments, confirming what was once
                                    just theoretical!
                                </p>

                                <div className="bg-space-dark p-6 rounded-lg border-l-4 border-cyan-400 my-8">
                                    <p className="font-ui text-cyan-400 font-bold mb-2">🎮 GAME CONNECTION</p>
                                    <p>
                                        In Mach Surfer, you pilot a probe through Neptune&apos;s supersonic winds, racing at
                                        speeds approaching and exceeding Mach 1 (the speed of sound). The diamonds you
                                        collect in the game represent Neptune&apos;s real diamond rain! Ride green wind currents
                                        for speed boosts and break the sound barrier for bonus points!
                                    </p>
                                </div>

                                <h3 className="font-heading text-xl text-neon-purple mt-8 mb-4">🔊 Supersonic Winds</h3>
                                <p>
                                    Neptune&apos;s winds are the fastest in the solar system, reaching speeds that would be
                                    supersonic on Earth. What makes this even more remarkable is that Neptune receives very
                                    little heat from the Sun due to its extreme distance. Scientists believe the planet&apos;s
                                    internal heat, possibly from gravitational compression or radioactive decay, powers these
                                    incredible atmospheric phenomena. The wind speeds in the game are inspired by these
                                    real supersonic currents!
                                </p>

                                <h3 className="font-heading text-xl text-neon-purple mt-8 mb-4">📐 Mathematical Discovery</h3>
                                <p>
                                    Neptune was the first planet discovered through mathematical prediction rather than
                                    observation. In 1846, French mathematician Urbain Le Verrier and British mathematician
                                    John Couch Adams independently calculated that an unknown planet must exist based on
                                    perturbations in Uranus&apos;s orbit. When German astronomer Johann Galle pointed his
                                    telescope at the predicted location, Neptune was exactly where the math said it would be!
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
                                        <span>Max Wind Speed</span>
                                        <span className="text-cyan-400 font-bold">2,000 km/h 🔊</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/10 pb-2">
                                        <span>Moons</span>
                                        <span className="text-neon-cyan">16 known</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Diamond Rain?</span>
                                        <span className="text-purple-400 font-bold">YES! 💎</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="planet-card">
                                <h3 className="font-heading text-xl text-neon-purple mb-4">🌙 Neptune&apos;s Moons</h3>
                                <div className="space-y-4 text-sm text-text-secondary">
                                    <div>
                                        <p className="font-bold text-white">Triton (Largest)</p>
                                        <p>The only large moon in the solar system that orbits retrograde
                                            (backwards). Has active nitrogen geysers!</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Nereid</p>
                                        <p>Has one of the most eccentric orbits of any moon, ranging from
                                            1.4 to 9.6 million km from Neptune.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Proteus</p>
                                        <p>Neptune&apos;s second-largest moon, irregularly shaped like a
                                            giant potato tumbling through space.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="planet-card bg-gradient-to-br from-cyan-900/30 to-blue-900/30">
                                <h3 className="font-heading text-xl text-cyan-400 mb-4">💡 Amazing Facts</h3>
                                <div className="space-y-4 text-sm text-text-dim">
                                    <p className="italic border-l-2 border-cyan-500 pl-3">
                                        &quot;Neptune&apos;s Great Dark Spot (discovered 1989) completely
                                        disappeared by 1994 - unlike Jupiter&apos;s persistent Great Red Spot!&quot;
                                    </p>
                                    <p className="italic border-l-2 border-purple-500 pl-3">
                                        &quot;It rains diamonds on Neptune! The extreme pressure converts
                                        methane into diamond crystals that sink toward the core.&quot;
                                    </p>
                                    <p className="italic border-l-2 border-blue-500 pl-3">
                                        &quot;Neptune has completed only one full orbit around the Sun since
                                        its discovery in 1846 - it finished in 2011!&quot;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Exploration History */}
                        <article className="planet-card">
                            <h2 className="font-heading text-2xl text-neon-cyan mb-6">
                                🛸 Exploration History: Voyager 2&apos;s Grand Finale
                            </h2>
                            <div className="prose prose-invert max-w-none text-text-secondary">
                                <p>
                                    The only spacecraft to ever visit Neptune was NASA&apos;s Voyager 2, which made
                                    its closest approach on August 25, 1989. This flyby was the culmination of
                                    the &quot;Grand Tour&quot;—a rare planetary alignment that allowed a single spacecraft
                                    to visit Jupiter, Saturn, Uranus, and Neptune using gravity assists.
                                </p>
                                <p className="mt-4">
                                    During its encounter, Voyager 2 discovered six new moons, five rings, and
                                    captured stunning images of the Great Dark Spot. It detected Neptune&apos;s
                                    magnetic field, measured the planet&apos;s rotation period, and recorded the
                                    supersonic winds that inspired the Mach Surfer game!
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
