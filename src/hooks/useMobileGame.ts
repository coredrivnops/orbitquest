'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { soundManager } from '@/utils/soundManager';

/**
 * Hook to handle all mobile gaming concerns:
 * - iOS audio context unlock on first user gesture
 * - Wake Lock to prevent screen dimming during gameplay
 * - Orientation detection and landscape hint
 * - Viewport zoom prevention during gameplay
 * - Install prompt for PWA
 */
export function useMobileGame(isPlaying: boolean = false) {
    const [isLandscape, setIsLandscape] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isPWA, setIsPWA] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
    const audioUnlockedRef = useRef(false);

    // Detect mobile and landscape on mount
    useEffect(() => {
        const checkDevice = () => {
            const mobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || ('ontouchstart' in window && window.innerWidth < 1024);
            setIsMobile(mobile);

            // Check if running as installed PWA
            const standalone = window.matchMedia('(display-mode: standalone)').matches
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                || (window.navigator as any).standalone === true;
            setIsPWA(standalone);
        };

        const checkOrientation = () => {
            if (window.screen?.orientation) {
                setIsLandscape(window.screen.orientation.type.includes('landscape'));
            } else {
                setIsLandscape(window.innerWidth > window.innerHeight);
            }
        };

        checkDevice();
        checkOrientation();

        const handleOrientationChange = () => {
            setTimeout(checkOrientation, 100); // Small delay for iOS
        };

        window.addEventListener('resize', handleOrientationChange);
        window.addEventListener('orientationchange', handleOrientationChange);
        if (window.screen?.orientation) {
            window.screen.orientation.addEventListener('change', handleOrientationChange);
        }

        return () => {
            window.removeEventListener('resize', handleOrientationChange);
            window.removeEventListener('orientationchange', handleOrientationChange);
            if (window.screen?.orientation) {
                window.screen.orientation.removeEventListener('change', handleOrientationChange);
            }
        };
    }, []);

    // iOS audio unlock: resume AudioContext on first user gesture
    useEffect(() => {
        if (audioUnlockedRef.current) return;

        const unlockAudio = async () => {
            try {
                await soundManager.resumeAudioContext();
                audioUnlockedRef.current = true;
                // Remove listeners after first successful unlock
                document.removeEventListener('touchstart', unlockAudio);
                document.removeEventListener('touchend', unlockAudio);
                document.removeEventListener('click', unlockAudio);
            } catch {
                // Retry on next gesture
            }
        };

        document.addEventListener('touchstart', unlockAudio, { once: false, passive: true });
        document.addEventListener('touchend', unlockAudio, { once: false, passive: true });
        document.addEventListener('click', unlockAudio, { once: false, passive: true });

        return () => {
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('touchend', unlockAudio);
            document.removeEventListener('click', unlockAudio);
        };
    }, []);

    // Wake Lock: keep screen on during gameplay
    useEffect(() => {
        const requestWakeLock = async () => {
            if (!('wakeLock' in navigator)) return;

            try {
                if (isPlaying && !wakeLockRef.current) {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    wakeLockRef.current.addEventListener('release', () => {
                        wakeLockRef.current = null;
                    });
                } else if (!isPlaying && wakeLockRef.current) {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                }
            } catch {
                // Wake Lock not supported or denied
            }
        };

        requestWakeLock();

        // Re-acquire wake lock when page becomes visible again
        const handleVisibility = () => {
            if (document.visibilityState === 'visible' && isPlaying) {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => { });
            }
        };
    }, [isPlaying]);

    // Viewport zoom prevention during gameplay
    useEffect(() => {
        if (!isMobile) return;

        const metaViewport = document.querySelector('meta[name="viewport"]');
        const originalContent = metaViewport?.getAttribute('content') || '';

        if (isPlaying) {
            // Prevent accidental zoom during gameplay (double-tap, pinch)
            metaViewport?.setAttribute('content',
                'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
            );
        } else {
            // Restore normal zoom when not playing
            metaViewport?.setAttribute('content',
                'width=device-width, initial-scale=1, viewport-fit=cover'
            );
        }

        return () => {
            metaViewport?.setAttribute('content', originalContent || 'width=device-width, initial-scale=1');
        };
    }, [isPlaying, isMobile]);

    // PWA Install Prompt
    useEffect(() => {
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            deferredPromptRef.current = e as BeforeInstallPromptEvent;
            // Only show if user has played at least once
            const progress = localStorage.getItem('orbitquest_progress');
            if (progress) {
                setShowInstallPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPromptRef.current) return;

        deferredPromptRef.current.prompt();
        const { outcome } = await deferredPromptRef.current.userChoice;
        if (outcome === 'accepted') {
            setShowInstallPrompt(false);
        }
        deferredPromptRef.current = null;
    }, []);

    const dismissInstallPrompt = useCallback(() => {
        setShowInstallPrompt(false);
        // Don't show again this session
        sessionStorage.setItem('orbitquest_install_dismissed', 'true');
    }, []);

    return {
        isMobile,
        isLandscape,
        isPWA,
        showInstallPrompt: showInstallPrompt && !sessionStorage.getItem('orbitquest_install_dismissed'),
        installApp,
        dismissInstallPrompt,
    };
}

// Type for BeforeInstallPromptEvent (not in standard TS types)
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
