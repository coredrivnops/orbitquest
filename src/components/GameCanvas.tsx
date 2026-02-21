'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameCanvasProps {
    onGameLoop: (ctx: CanvasRenderingContext2D, frameCount: number, deltaTime: number) => void;
    onMount?: (canvas: HTMLCanvasElement) => void;
    onCleanup?: () => void;
    onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onTouchStart?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
    onTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
    onTouchEnd?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
    width?: number;
    height?: number;
    className?: string;
}

export default function GameCanvas({
    onGameLoop,
    onMount,
    onCleanup,
    onMouseMove,
    onClick,
    onTouchStart: externalTouchStart,
    onTouchMove: externalTouchMove,
    onTouchEnd: externalTouchEnd,
    width = 1280,
    height = 720,
    className = ''
}: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const frameCountRef = useRef<number>(0);
    const lastTimestampRef = useRef<number>(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLandscapeHint, setShowLandscapeHint] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            const mobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || ('ontouchstart' in window && window.innerWidth < 1024);
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show landscape hint on mobile portrait
    useEffect(() => {
        if (!isMobile) {
            setShowLandscapeHint(false);
            return;
        }

        const checkOrientation = () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            setShowLandscapeHint(isPortrait);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 150));

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, [isMobile]);

    // Toggle fullscreen - works on all platforms including iOS
    const toggleFullscreen = useCallback(() => {
        const container = canvasRef.current?.closest('.game-canvas-container') as HTMLElement;
        if (!container) return;

        const setFullscreenState = (active: boolean) => {
            setIsFullscreen(active);
            if (active) {
                container.classList.add('force-fullscreen');
                document.body.classList.add('game-fullscreen-active');
            } else {
                container.classList.remove('force-fullscreen');
                document.body.classList.remove('game-fullscreen-active');
            }
        };

        if (!document.fullscreenElement && !isFullscreen) {
            // Try native fullscreen first (Android Chrome, Desktop)
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const requestFS = container.requestFullscreen
                || (container as any).webkitRequestFullscreen
                || (container as any).msRequestFullscreen;
            /* eslint-enable @typescript-eslint/no-explicit-any */

            if (requestFS) {
                requestFS.call(container)
                    .then(() => setIsFullscreen(true))
                    .catch(() => setFullscreenState(true)); // CSS fallback (iOS)
            } else {
                // iOS Safari: no native fullscreen API, use CSS
                setFullscreenState(true);
            }

            // Try to lock to landscape on mobile
            if (isMobile && screen.orientation && 'lock' in screen.orientation) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (screen.orientation as any).lock('landscape').catch(() => { });
            }
        } else {
            // Exit fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            setFullscreenState(false);

            // Unlock orientation
            if (screen.orientation && 'unlock' in screen.orientation) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (screen.orientation as any).unlock();
            }
        }
    }, [isFullscreen, isMobile]);

    // Listen for native fullscreen changes
    useEffect(() => {
        const handleChange = () => {
            const container = canvasRef.current?.closest('.game-canvas-container') as HTMLElement;
            if (document.fullscreenElement) {
                setIsFullscreen(true);
            } else {
                setIsFullscreen(false);
                if (container) {
                    container.classList.remove('force-fullscreen');
                    document.body.classList.remove('game-fullscreen-active');
                }
            }
        };

        document.addEventListener('fullscreenchange', handleChange);
        document.addEventListener('webkitfullscreenchange', handleChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleChange);
            document.removeEventListener('webkitfullscreenchange', handleChange);
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            const container = canvasRef.current?.closest('.game-canvas-container') as HTMLElement;
            if (container) container.classList.remove('force-fullscreen');
            document.body.classList.remove('game-fullscreen-active');
        };
    }, []);

    // Canvas init and game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Handle high DPI displays (Retina, etc.)
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        if (onMount) {
            onMount(canvas);
        }

        const animate = (timestamp: number) => {
            // Compute delta-time normalized to 60fps (1.0 = 16.67ms)
            if (lastTimestampRef.current === 0) lastTimestampRef.current = timestamp;
            const rawDt = (timestamp - lastTimestampRef.current) / 16.667;
            // Clamp to prevent physics explosion after tab-away (max 3 frames)
            const deltaTime = Math.min(rawDt, 3);
            lastTimestampRef.current = timestamp;

            onGameLoop(ctx, frameCountRef.current, deltaTime);
            frameCountRef.current++;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (onCleanup) {
                onCleanup();
            }
        };
    }, [width, height, onGameLoop, onMount, onCleanup]);

    // Create synthetic mouse event from touch
    const touchToMouse = useCallback((touch: React.Touch, target: EventTarget) => {
        return {
            clientX: touch.clientX,
            clientY: touch.clientY,
            pageX: touch.pageX,
            pageY: touch.pageY,
            currentTarget: target,
            preventDefault: () => { },
            stopPropagation: () => { },
            nativeEvent: { offsetX: 0, offsetY: 0 },
        } as unknown as React.MouseEvent<HTMLCanvasElement>;
    }, []);

    // Touch handlers with proper event synthesis
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        // Always prevent default to avoid scroll/zoom during gameplay
        if (onClick || onMouseMove) {
            e.preventDefault();
        }

        // Call external handler if provided
        if (externalTouchStart) {
            externalTouchStart(e);
            return;
        }

        const touch = e.touches[0];
        if (!touch) return;

        if (onClick) {
            onClick(touchToMouse(touch, e.currentTarget));
        }
        if (onMouseMove) {
            onMouseMove(touchToMouse(touch, e.currentTarget));
        }
    }, [onClick, onMouseMove, externalTouchStart, touchToMouse]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        if (onMouseMove || externalTouchMove) {
            e.preventDefault();
        }

        if (externalTouchMove) {
            externalTouchMove(e);
            return;
        }

        const touch = e.touches[0];
        if (!touch || !onMouseMove) return;
        onMouseMove(touchToMouse(touch, e.currentTarget));
    }, [onMouseMove, externalTouchMove, touchToMouse]);

    const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (externalTouchEnd) {
            externalTouchEnd(e);
        }
    }, [externalTouchEnd]);

    return (
        <div className={`game-canvas-wrapper relative w-full h-full ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block"
                style={{ imageRendering: 'pixelated', touchAction: 'none' }}
                onMouseMove={onMouseMove}
                onClick={onClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* Landscape Orientation Hint - shown on mobile portrait */}
            {showLandscapeHint && !isFullscreen && (
                <div className="landscape-hint">
                    <div className="landscape-hint-content">
                        <div className="landscape-hint-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" className="rotate-phone" />
                                <path d="M12 18h.01" className="rotate-phone" />
                            </svg>
                            <div className="rotate-arrow">↻</div>
                        </div>
                        <p className="text-sm font-medium text-white/90">Rotate for best experience</p>
                        <button
                            onClick={() => setShowLandscapeHint(false)}
                            className="text-xs text-white/50 hover:text-white/80 mt-1 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Fullscreen Button - visible on both mobile and desktop */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreen();
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreen();
                }}
                className="fullscreen-btn"
                aria-label="Toggle Fullscreen"
            >
                {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                )}
            </button>

            {/* Mobile Exit Fullscreen - extra large tap target at top */}
            {isFullscreen && isMobile && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleFullscreen();
                    }}
                    className="mobile-exit-fs"
                    aria-label="Exit Fullscreen"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
