import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-neon-cyan/20 bg-space-deep/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">🪐</span>
                            <span className="font-heading text-xl text-neon-cyan">OrbitQuest</span>
                        </div>
                        <p className="text-text-secondary text-sm max-w-md">
                            Explore the solar system through arcade-style mini-games.
                            Learn about planets, moons, and space phenomena while having fun!
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading text-sm text-neon-purple mb-4 uppercase tracking-wider">
                            Explore
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
                                    Solar System Hub
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
                                    Space Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-heading text-sm text-neon-purple mb-4 uppercase tracking-wider">
                            Legal
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
                                    Terms of Use
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-neon-cyan/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-text-dim text-sm">
                        © {currentYear} OrbitQuest by CoredrivN. All rights reserved.
                    </p>
                    <p className="text-text-dim text-xs">
                        Educational content sourced from NASA and ESA.
                    </p>
                </div>
            </div>
        </footer>
    );
}
