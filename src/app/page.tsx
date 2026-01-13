import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlanetCard from '@/components/PlanetCard';
import { PLANETS } from '@/lib/gameTypes';

export default function HomePage() {
    return (
        <>
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-16 lg:py-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        {/* Animated Sun */}
                        <div className="relative mx-auto w-32 h-32 mb-8">
                            <div
                                className="absolute inset-0 rounded-full animate-pulse-glow"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, #fef08a, #f97316, #dc2626)',
                                    boxShadow: '0 0 60px #f97316, 0 0 100px #fef08a',
                                }}
                            />
                        </div>

                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-neon-cyan glow-text mb-4">
                            OrbitQuest
                        </h1>
                        <p className="font-ui text-xl text-neon-purple mb-2">
                            Solar System Arcade
                        </p>
                        <p className="text-text-secondary max-w-2xl mx-auto text-lg mb-8">
                            Embark on an interplanetary adventure! Play 8 unique arcade games,
                            each set on a different planet. Earn Stardust, unlock new worlds,
                            and learn about our cosmic neighborhood.
                        </p>

                        {/* Stats */}
                        <div className="flex justify-center gap-8 mb-12">
                            <div className="text-center">
                                <p className="font-heading text-3xl text-neon-cyan">8</p>
                                <p className="text-text-dim text-sm">Planets</p>
                            </div>
                            <div className="text-center">
                                <p className="font-heading text-3xl text-neon-purple">8</p>
                                <p className="text-text-dim text-sm">Games</p>
                            </div>
                            <div className="text-center">
                                <p className="font-heading text-3xl text-yellow-400">∞</p>
                                <p className="text-text-dim text-sm">Fun</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Orbital Path Decoration */}
                <div className="relative">
                    <div
                        className="absolute left-1/2 -translate-x-1/2 w-[200%] h-96 border border-neon-cyan/10 rounded-[100%] -top-48 pointer-events-none"
                        style={{ transform: 'translateX(-50%) rotateX(75deg)' }}
                    />
                </div>

                {/* Planet Grid */}
                <section className="py-16 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-heading text-2xl text-center text-neon-purple mb-4">
                            Choose Your Destination
                        </h2>
                        <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
                            Earth and Mars are unlocked from the start. Play games to earn Stardust
                            and unlock the outer planets!
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {PLANETS.map((planet, index) => (
                                <PlanetCard key={planet.id} planet={planet} index={index} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 bg-space-dark/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-heading text-2xl text-center text-neon-cyan mb-12">
                            How It Works
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                                    <span className="text-3xl">🎮</span>
                                </div>
                                <h3 className="font-ui text-lg text-neon-cyan mb-2">Play Games</h3>
                                <p className="text-text-secondary text-sm">
                                    Start with Earth and Mars. Each game has unique mechanics
                                    inspired by real planetary science.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-purple/20 flex items-center justify-center">
                                    <span className="text-3xl">✨</span>
                                </div>
                                <h3 className="font-ui text-lg text-neon-purple mb-2">Earn Stardust</h3>
                                <p className="text-text-secondary text-sm">
                                    Score points to earn Stardust. The better you play,
                                    the more Stardust you collect!
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/20 flex items-center justify-center">
                                    <span className="text-3xl">🔓</span>
                                </div>
                                <h3 className="font-ui text-lg text-yellow-400 mb-2">Unlock Planets</h3>
                                <p className="text-text-secondary text-sm">
                                    Spend Stardust to unlock new planets. Each one offers
                                    a new challenge and educational content!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Educational Teaser */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="planet-card text-center">
                            <h2 className="font-heading text-2xl text-neon-cyan mb-4">
                                Learn While You Play
                            </h2>
                            <p className="text-text-secondary max-w-2xl mx-auto mb-6">
                                Every game includes educational content about real space science.
                                Discover the mysteries of the Kessler Syndrome, explore Martian terrain,
                                dive into Jupiter&apos;s storms, and more. All facts sourced from NASA and ESA.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <span className="px-4 py-2 rounded-full bg-neon-cyan/10 text-neon-cyan text-sm">
                                    🛰️ Orbital Mechanics
                                </span>
                                <span className="px-4 py-2 rounded-full bg-neon-purple/10 text-neon-purple text-sm">
                                    🌋 Planetary Geology
                                </span>
                                <span className="px-4 py-2 rounded-full bg-yellow-400/10 text-yellow-400 text-sm">
                                    ⚡ Space Weather
                                </span>
                                <span className="px-4 py-2 rounded-full bg-pink-400/10 text-pink-400 text-sm">
                                    🌀 Atmospheric Science
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
