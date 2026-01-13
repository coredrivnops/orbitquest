'use client';

import Link from 'next/link';
import StardustCounter from './StardustCounter';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-space-deep/80 border-b border-neon-cyan/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <span className="text-3xl transition-transform group-hover:scale-110">🪐</span>
                        <span className="font-heading text-xl text-neon-cyan glow-text hidden sm:block">
                            OrbitQuest
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="font-ui text-text-secondary hover:text-neon-cyan transition-colors"
                        >
                            Solar System
                        </Link>
                        <Link
                            href="/about"
                            className="font-ui text-text-secondary hover:text-neon-cyan transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="font-ui text-text-secondary hover:text-neon-cyan transition-colors"
                        >
                            Contact
                        </Link>
                    </nav>

                    {/* Stardust Counter */}
                    <StardustCounter />
                </div>
            </div>
        </header>
    );
}
