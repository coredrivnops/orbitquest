'use client';

import { useMobileGame } from '@/hooks/useMobileGame';

/**
 * PWA Install Banner - Shows when:
 * 1. User has played at least once (has progress in localStorage)
 * 2. The beforeinstallprompt event fired (browser supports install)
 * 3. User hasn't dismissed it this session
 * 4. Not already running as installed PWA
 */
export default function PWAInstallBanner() {
    const { showInstallPrompt, installApp, dismissInstallPrompt, isPWA } = useMobileGame();

    if (!showInstallPrompt || isPWA) return null;

    return (
        <div className="pwa-install-banner">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-3xl">🚀</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                        Install OrbitQuest
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Add to home screen for the best gaming experience — play offline!
                    </p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                    <button
                        onClick={dismissInstallPrompt}
                        className="px-3 py-1.5 text-xs text-text-dim hover:text-white transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={installApp}
                        className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-neon-cyan to-neon-purple text-black rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
