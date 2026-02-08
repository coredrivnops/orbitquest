'use client';

import { useEffect, useRef, useState } from 'react';

interface GameCanvasProps {
    onGameLoop: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
    onMount?: (canvas: HTMLCanvasElement) => void;
    onCleanup?: () => void;
    onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
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
    width = 1280,
    height = 720,
    className = ''
}: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const frameCountRef = useRef<number>(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        // Target the parent wrapper (which contains both Canvas and UI Overlays)
        // We specifically look for the .game-canvas-container class which frames the game area in page.tsx
        const container = canvasRef.current?.closest('.game-canvas-container') as HTMLElement;

        if (!container) return;

        // Helper to update state and class
        const setFullscreenState = (active: boolean) => {
            setIsFullscreen(active);
            if (active) {
                container.classList.add('force-fullscreen');
            } else {
                container.classList.remove('force-fullscreen');
            }
        };

        if (!document.fullscreenElement && !isFullscreen) {
            // Enter Fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen()
                    .then(() => setIsFullscreen(true)) // Native success
                    .catch(() => setFullscreenState(true)); // Native fail -> CSS fallback
            } else {
                // iOS / No API -> CSS fallback
                setFullscreenState(true);
            }
        } else {
            // Exit Fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            setFullscreenState(false);
        }
    };

    // Listen for native fullscreen changes
    useEffect(() => {
        const handleChange = () => {
            const container = canvasRef.current?.closest('.game-canvas-container') as HTMLElement;
            if (document.fullscreenElement) {
                setIsFullscreen(true);
            } else {
                // If native fullscreen exited, allow state to sync
                setIsFullscreen(false);
                if (container) container.classList.remove('force-fullscreen');
            }
        };

        document.addEventListener('fullscreenchange', handleChange);
        document.addEventListener('webkitfullscreenchange', handleChange); // iOS/Safari legacy

        return () => {
            document.removeEventListener('fullscreenchange', handleChange);
            document.removeEventListener('webkitfullscreenchange', handleChange);
        };
    }, []);



    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const container = canvasRef.current?.closest('.game-canvas-container') as HTMLElement;
            if (container) container.classList.remove('force-fullscreen');
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // ... (rest of canvas init logic is unchanged, but ensuring I don't delete it)
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for performance
        if (!ctx) return;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        // We set the display size via CSS (className/style) and internal size here
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Call onMount (e.g., for setting up event listeners)
        if (onMount) {
            onMount(canvas);
        }

        const animate = () => {
            // Clear canvas (optional, depending on game logic, but usually good practice)
            // ctx.clearRect(0, 0, width, height); 

            // We assume the game loop handles clearing or drawing over everything
            onGameLoop(ctx, frameCountRef.current);

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

    return (
        <div
            className={`relative w-full h-full ${className}`}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block"
                style={{ imageRendering: 'pixelated' }}
                onMouseMove={onMouseMove}
                onClick={onClick}
                onTouchStart={(e) => {
                    if (onClick || onMouseMove) {
                        e.preventDefault(); // Prevent scrolling
                        const touch = e.touches[0];

                        // If we have an onClick handler, trigger it (for tap-to-jump mechanics)
                        if (onClick) {
                            const syntheticEvent = {
                                clientX: touch.clientX,
                                clientY: touch.clientY,
                                currentTarget: e.currentTarget,
                                preventDefault: () => { },
                                stopPropagation: () => { },
                            } as unknown as React.MouseEvent<HTMLCanvasElement>;
                            onClick(syntheticEvent);
                        }

                        // Also trigger onMouseMove for initial position set
                        if (onMouseMove) {
                            const syntheticEvent = {
                                clientX: touch.clientX,
                                clientY: touch.clientY,
                                currentTarget: e.currentTarget,
                                preventDefault: () => { },
                                stopPropagation: () => { },
                            } as unknown as React.MouseEvent<HTMLCanvasElement>;
                            onMouseMove(syntheticEvent);
                        }
                    }
                }}
                onTouchMove={(e) => {
                    if (onMouseMove) {
                        e.preventDefault(); // Prevent scrolling
                        const rect = e.currentTarget.getBoundingClientRect(); // Capture rect here
                        const touch = e.touches[0];

                        // Create a synthetic MouseEvent
                        const syntheticEvent = {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                            currentTarget: e.currentTarget,
                            preventDefault: () => { },
                            stopPropagation: () => { },
                            // Add other properties if needed
                        } as unknown as React.MouseEvent<HTMLCanvasElement>;

                        onMouseMove(syntheticEvent);
                    }
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                }}
            />
            {/* Fullscreen Button (Mobile/Tablet Only) */}
            <button
                onClick={toggleFullscreen}
                onTouchEnd={(e) => {
                    // Ensure touch also triggers it, preventing "ghost clicks" or missed taps
                    e.preventDefault();
                    toggleFullscreen();
                }}
                className="absolute top-4 right-4 z-[10000] p-3 bg-black/60 hover:bg-black/90 rounded-full text-white/90 hover:text-white transition-all md:hidden border border-white/30 backdrop-blur-md shadow-lg active:scale-95"
                aria-label="Toggle Fullscreen"
            >
                {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                )}
            </button>
        </div>
    );
}
