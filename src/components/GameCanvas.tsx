'use client';

import { useEffect, useRef } from 'react';

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

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
        <div className={`game-canvas-container ${className}`}>
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
                        const rect = e.currentTarget.getBoundingClientRect();
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
        </div>
    );
}
