import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us - OrbitQuest',
    description: 'Learn about OrbitQuest, a free educational space arcade created to make learning about our solar system fun.',
};

export default function AboutPage() {
    return (
        <>
            <Header />

            <main className="flex-1 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-3xl text-neon-cyan mb-8">About OrbitQuest</h1>

                    <div className="space-y-12">
                        {/* Our Mission */}
                        <section className="planet-card">
                            <h2 className="font-heading text-xl text-neon-purple mb-4">🚀 Our Mission</h2>
                            <p className="text-text-secondary mb-4">
                                OrbitQuest was born from a simple idea: learning about space should be as exciting
                                as exploring it. We created this arcade-style game platform to make planetary science
                                accessible and fun for everyone—whether you&apos;re a curious student, a space enthusiast,
                                or just looking for an entertaining way to learn.
                            </p>
                            <p className="text-text-secondary">
                                Each game is designed to incorporate real scientific concepts. From Neptune&apos;s
                                supersonic winds to Jupiter&apos;s massive storms, every game mechanic draws inspiration
                                from actual planetary phenomena. Every game is a lesson wrapped in fun.
                            </p>
                        </section>

                        {/* Why OrbitQuest */}
                        <section className="planet-card">
                            <h2 className="font-heading text-xl text-neon-purple mb-4">🌌 Why OrbitQuest?</h2>
                            <ul className="space-y-4 text-text-secondary">
                                <li className="flex items-start gap-3">
                                    <span className="text-neon-cyan text-xl">✓</span>
                                    <span>
                                        <strong className="text-text-primary">Science-Inspired Games:</strong> Every mechanic
                                        draws inspiration from real planetary science and space phenomena.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-neon-cyan text-xl">✓</span>
                                    <span>
                                        <strong className="text-text-primary">Clean Design:</strong> Beautiful, clutter-free interface
                                        designed for focus and immersion.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-neon-cyan text-xl">✓</span>
                                    <span>
                                        <strong className="text-text-primary">Play Anywhere:</strong> Works in your browser
                                        on desktop and mobile. No downloads required.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-neon-cyan text-xl">✓</span>
                                    <span>
                                        <strong className="text-text-primary">Progression System:</strong> Earn Stardust,
                                        unlock new planets, and track your high scores.
                                    </span>
                                </li>
                            </ul>
                        </section>

                        {/* What We Offer */}
                        <section className="planet-card">
                            <h2 className="font-heading text-xl text-neon-purple mb-4">🎮 What We Offer</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-space-deep/50 rounded-lg p-4">
                                    <p className="font-ui text-neon-cyan mb-2">10 Unique Games</p>
                                    <p className="text-text-secondary text-sm">
                                        One game per celestial body, each with unique mechanics
                                    </p>
                                </div>
                                <div className="bg-space-deep/50 rounded-lg p-4">
                                    <p className="font-ui text-neon-cyan mb-2">Educational Content</p>
                                    <p className="text-text-secondary text-sm">
                                        Science facts sourced from NASA, ESA, and other resources
                                    </p>
                                </div>
                                <div className="bg-space-deep/50 rounded-lg p-4">
                                    <p className="font-ui text-neon-cyan mb-2">Stardust Rewards</p>
                                    <p className="text-text-secondary text-sm">
                                        Earn in-game currency by playing, unlock new worlds
                                    </p>
                                </div>
                                <div className="bg-space-deep/50 rounded-lg p-4">
                                    <p className="font-ui text-neon-cyan mb-2">High Score Tracking</p>
                                    <p className="text-text-secondary text-sm">
                                        Challenge yourself to beat your personal bests
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Free & Accessible */}
                        <section className="planet-card">
                            <h2 className="font-heading text-xl text-neon-purple mb-4">💫 Free & Accessible</h2>
                            <p className="text-text-secondary mb-4">
                                OrbitQuest is completely free to play. We support ongoing development through
                                non-intrusive advertisements via Google AdSense. We believe educational entertainment
                                should be accessible to everyone.
                            </p>
                            <p className="text-text-secondary">
                                Your progress is saved locally on your device, so your Stardust and unlocks
                                are always there when you return. No accounts, no subscriptions—just pure
                                space arcade fun.
                            </p>
                        </section>

                        {/* Our Sources */}
                        <section className="planet-card">
                            <h2 className="font-heading text-xl text-neon-purple mb-4">📚 Educational Sources</h2>
                            <p className="text-text-secondary mb-4">
                                We strive for accuracy in our educational content. Information is gathered from
                                publicly available resources including:
                            </p>
                            <ul className="space-y-2 text-text-secondary">
                                <li>• NASA (National Aeronautics and Space Administration)</li>
                                <li>• ESA (European Space Agency)</li>
                                <li>• Established astronomy and planetary science resources</li>
                            </ul>
                            <p className="text-text-dim text-sm mt-4">
                                Note: Content is provided for entertainment and general educational purposes.
                                Please verify with authoritative sources for academic use.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="text-center">
                            <h2 className="font-heading text-xl text-neon-cyan mb-4">Get in Touch</h2>
                            <p className="text-text-secondary mb-6">
                                Have questions, feedback, or just want to say hello? We&apos;d love to hear from you!
                            </p>
                            <a
                                href="/contact"
                                className="btn-neon inline-block"
                            >
                                Contact Us
                            </a>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
