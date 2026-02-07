import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lost in Space - 404 | OrbitQuest',
    description: 'Looks like you drifted off course! This page doesn\'t exist in our solar system.',
};

export default function NotFound() {
    return (
        <>
            <Header />

            <main className="flex-1 flex items-center justify-center min-h-[70vh] relative overflow-hidden">
                {/* Animated starfield background */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Stars */}
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: Math.random() * 0.8 + 0.2,
                            }}
                        />
                    ))}

                    {/* Floating debris/asteroids */}
                    <div
                        className="absolute w-4 h-4 bg-gray-600 rounded-full animate-float opacity-40"
                        style={{ left: '20%', top: '30%', animationDuration: '8s' }}
                    />
                    <div
                        className="absolute w-6 h-6 bg-gray-700 rounded-full animate-float opacity-30"
                        style={{ left: '70%', top: '60%', animationDuration: '12s', animationDelay: '2s' }}
                    />
                    <div
                        className="absolute w-3 h-3 bg-gray-500 rounded-full animate-float opacity-50"
                        style={{ left: '80%', top: '20%', animationDuration: '10s', animationDelay: '4s' }}
                    />

                    {/* Nebula glow */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
                    {/* Big 404 */}
                    <div className="relative mb-8">
                        <h1 className="font-heading text-[150px] md:text-[200px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-neon-cyan via-purple-500 to-pink-500 opacity-20">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-8xl animate-float">🚀</span>
                        </div>
                    </div>

                    {/* Message */}
                    <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
                        Lost in <span className="text-neon-cyan">Space</span>!
                    </h2>

                    <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                        Houston, we have a problem! The page you&apos;re looking for has drifted
                        beyond the edge of our solar system. It might be hanging out with Pluto
                        somewhere in the Kuiper Belt.
                    </p>

                    {/* Fun fact */}
                    <div className="bg-space-tertiary/50 border border-neon-cyan/30 rounded-xl p-6 mb-8">
                        <p className="text-text-dim text-sm mb-2">🛸 DID YOU KNOW?</p>
                        <p className="text-text-secondary italic">
                            &quot;If you traveled at the speed of light, it would still take you
                            4.24 years to reach the nearest star, Proxima Centauri!&quot;
                        </p>
                    </div>

                    {/* Navigation options */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="px-8 py-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 border-2 border-neon-cyan rounded-xl text-neon-cyan font-heading text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2"
                        >
                            <span>🏠</span>
                            <span>Return to Mission Control</span>
                        </Link>

                        <Link
                            href="/games/pluto"
                            className="px-8 py-4 bg-neon-purple/20 hover:bg-neon-purple/30 border-2 border-neon-purple rounded-xl text-neon-purple font-heading text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center gap-2"
                        >
                            <span>🎮</span>
                            <span>Start Playing</span>
                        </Link>
                    </div>

                    {/* Coordinates joke */}
                    <p className="mt-8 text-text-dim text-xs font-mono">
                        Error coordinates: 404.000° N, ∞.000° W • Signal lost at {new Date().toISOString()}
                    </p>
                </div>
            </main>

            <Footer />
        </>
    );
}
