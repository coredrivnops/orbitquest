import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us - OrbitQuest',
    description: 'Get in touch with the OrbitQuest team. Report bugs, suggest features, or just say hello.',
};

export default function ContactPage() {
    return (
        <>
            <Header />

            <main className="flex-1 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-3xl text-neon-cyan mb-4">Contact Us</h1>
                    <p className="text-text-secondary mb-12">
                        We value your feedback, bug reports, and feature suggestions.
                        Get in touch—we&apos;d love to hear from you!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="planet-card">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">📧</span>
                                    <div>
                                        <h3 className="font-ui text-lg text-neon-purple mb-2">Email Us</h3>
                                        <a
                                            href="mailto:solutions@coredrivn.com"
                                            className="text-neon-cyan hover:underline"
                                        >
                                            solutions@coredrivn.com
                                        </a>
                                        <p className="text-text-dim text-sm mt-2">
                                            We typically respond within 24-48 hours.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="planet-card">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">🐛</span>
                                    <div>
                                        <h3 className="font-ui text-lg text-neon-purple mb-2">Bug Reports</h3>
                                        <p className="text-text-secondary">
                                            Found a glitch in the Matrix... er, solar system? Let us know!
                                            Please include:
                                        </p>
                                        <ul className="text-text-dim text-sm mt-2 space-y-1">
                                            <li>• Which game/page the bug occurred on</li>
                                            <li>• Your browser and device</li>
                                            <li>• Steps to reproduce the issue</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="planet-card">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">💡</span>
                                    <div>
                                        <h3 className="font-ui text-lg text-neon-purple mb-2">Feature Ideas</h3>
                                        <p className="text-text-secondary">
                                            Have an idea for a new game mechanic, planet feature, or
                                            educational topic? We&apos;re always looking to improve!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Preview */}
                        <div className="planet-card h-fit">
                            <h3 className="font-heading text-xl text-neon-purple mb-6">
                                Frequently Asked Questions
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <p className="font-ui text-neon-cyan mb-2">
                                        How do I save my progress?
                                    </p>
                                    <p className="text-text-secondary text-sm">
                                        Your progress is automatically saved in your browser&apos;s localStorage.
                                        It persists between sessions but is device-specific.
                                    </p>
                                </div>

                                <div>
                                    <p className="font-ui text-neon-cyan mb-2">
                                        Why can&apos;t I access some planets?
                                    </p>
                                    <p className="text-text-secondary text-sm">
                                        Outer planets require Stardust to unlock. Play Earth and Mars games
                                        to earn Stardust, then unlock new worlds!
                                    </p>
                                </div>

                                <div>
                                    <p className="font-ui text-neon-cyan mb-2">
                                        Is OrbitQuest free?
                                    </p>
                                    <p className="text-text-secondary text-sm">
                                        Yes! OrbitQuest is completely free. We support development through
                                        non-intrusive advertisements.
                                    </p>
                                </div>

                                <div>
                                    <p className="font-ui text-neon-cyan mb-2">
                                        Can I play on mobile?
                                    </p>
                                    <p className="text-text-secondary text-sm">
                                        Absolutely! OrbitQuest is fully responsive and works on phones
                                        and tablets. Just open it in your mobile browser.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
