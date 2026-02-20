'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import StardustCounter from './StardustCounter';
import { soundManager } from '@/utils/soundManager';

export default function Header() {
    const [, setUpdateFlag] = useState(false);

    // Initialize preferences from localStorage
    useEffect(() => {
        const reducedMotion = localStorage.getItem('orbitquest_reduced_motion') === 'true';
        if (reducedMotion) {
            document.body.classList.add('reduced-motion');
            setUpdateFlag(prev => !prev);
        }
    }, []);

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
                            href="/blog"
                            className="font-ui text-text-secondary hover:text-neon-cyan transition-colors"
                        >
                            Blog
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

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-4">
                        {/* Settings Menu */}
                        <div className="relative group">
                            <button
                                className="p-2 text-text-secondary hover:text-neon-cyan transition-colors rounded-full hover:bg-white/5"
                                title="Settings"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                </svg>
                            </button>

                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-56 py-2 bg-space-deep/95 border border-neon-cyan/30 rounded-lg shadow-2xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                <div className="px-4 py-2 border-b border-white/10">
                                    <span className="text-xs font-heading text-neon-purple uppercase tracking-widest">Settings</span>
                                </div>

                                {/* Audio Toggle */}
                                <button
                                    onClick={() => {
                                        soundManager.toggleMute();
                                        setUpdateFlag(prev => !prev);
                                    }}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group/item"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🔊</span>
                                        <span className="text-sm text-text-secondary group-hover/item:text-neon-cyan transition-colors">Audio</span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${soundManager.getMuted() ? 'bg-white/10' : 'bg-neon-cyan/50'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${soundManager.getMuted() ? 'left-1 bg-text-dim' : 'left-6 bg-white'}`} />
                                    </div>
                                </button>

                                {/* Reduced Motion Toggle */}
                                <button
                                    onClick={() => {
                                        const current = document.body.classList.contains('reduced-motion');
                                        if (current) {
                                            document.body.classList.remove('reduced-motion');
                                            localStorage.setItem('orbitquest_reduced_motion', 'false');
                                        } else {
                                            document.body.classList.add('reduced-motion');
                                            localStorage.setItem('orbitquest_reduced_motion', 'true');
                                        }
                                        setUpdateFlag(prev => !prev);
                                    }}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group/item"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">✨</span>
                                        <span className="text-sm text-text-secondary group-hover/item:text-neon-cyan transition-colors">Reduced Motion</span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${typeof document !== 'undefined' && document.body.classList.contains('reduced-motion') ? 'bg-neon-purple/50' : 'bg-white/10'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${typeof document !== 'undefined' && document.body.classList.contains('reduced-motion') ? 'left-6 bg-white' : 'left-1 bg-text-dim'}`} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Stardust Counter */}
                        <StardustCounter />
                    </div>
                </div>
            </div>
        </header>
    );
}
