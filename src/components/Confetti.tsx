'use client';

import { useEffect, useState, useCallback } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: 'circle' | 'square' | 'star';
}

interface ConfettiProps {
    active: boolean;
    onComplete?: () => void;
    colors?: string[];
    particleCount?: number;
    duration?: number;
    spread?: number;
}

const defaultColors = [
    '#00f0ff', // cyan
    '#a855f7', // purple
    '#ec4899', // pink
    '#fbbf24', // yellow/gold
    '#4ade80', // green
    '#f97316', // orange
    '#60a5fa', // blue
];

export default function Confetti({
    active,
    onComplete,
    colors = defaultColors,
    particleCount = 80,
    duration = 3000,
    spread = 400,
}: ConfettiProps) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const createParticles = useCallback(() => {
        const newParticles: Particle[] = [];
        const shapes: Particle['shape'][] = ['circle', 'square', 'star'];

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: 50, // Start from center (%)
                y: 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 6,
                speedX: (Math.random() - 0.5) * spread / 50,
                speedY: (Math.random() - 0.8) * spread / 30,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 20,
                opacity: 1,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
            });
        }

        return newParticles;
    }, [colors, particleCount, spread]);

    useEffect(() => {
        if (active && !isAnimating) {
            setIsAnimating(true);
            setParticles(createParticles());

            const timer = setTimeout(() => {
                setIsAnimating(false);
                setParticles([]);
                onComplete?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [active, isAnimating, createParticles, duration, onComplete]);

    useEffect(() => {
        if (!isAnimating || particles.length === 0) return;

        let animationFrame: number;
        let lastTime = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps
            lastTime = currentTime;

            setParticles(prevParticles =>
                prevParticles.map(particle => ({
                    ...particle,
                    x: particle.x + particle.speedX * deltaTime,
                    y: particle.y + particle.speedY * deltaTime,
                    speedY: particle.speedY + 0.3 * deltaTime, // gravity
                    rotation: particle.rotation + particle.rotationSpeed * deltaTime,
                    opacity: Math.max(0, particle.opacity - 0.008 * deltaTime),
                }))
            );

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [isAnimating, particles.length]);

    if (!isAnimating || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.shape !== 'star' ? particle.color : 'transparent',
                        borderRadius: particle.shape === 'circle' ? '50%' : '0',
                        transform: `rotate(${particle.rotation}deg)`,
                        opacity: particle.opacity,
                        boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
                        transition: 'none',
                    }}
                >
                    {particle.shape === 'star' && (
                        <svg
                            width={particle.size}
                            height={particle.size}
                            viewBox="0 0 24 24"
                            fill={particle.color}
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    )}
                </div>
            ))}
        </div>
    );
}

// Stardust burst effect - smaller, more focused
export function StardustBurst({
    active,
    x = 50,
    y = 50,
    onComplete,
}: {
    active: boolean;
    x?: number;
    y?: number;
    onComplete?: () => void;
}) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (active && !isAnimating) {
            setIsAnimating(true);

            const newParticles: Particle[] = [];
            const colors = ['#fbbf24', '#fcd34d', '#fef3c7', '#ffffff'];

            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const speed = Math.random() * 3 + 2;
                newParticles.push({
                    id: i,
                    x,
                    y,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 6 + 3,
                    speedX: Math.cos(angle) * speed,
                    speedY: Math.sin(angle) * speed,
                    rotation: 0,
                    rotationSpeed: 0,
                    opacity: 1,
                    shape: 'circle',
                });
            }

            setParticles(newParticles);

            const timer = setTimeout(() => {
                setIsAnimating(false);
                setParticles([]);
                onComplete?.();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [active, isAnimating, x, y, onComplete]);

    useEffect(() => {
        if (!isAnimating || particles.length === 0) return;

        let animationFrame: number;

        const animate = () => {
            setParticles(prevParticles =>
                prevParticles.map(particle => ({
                    ...particle,
                    x: particle.x + particle.speedX,
                    y: particle.y + particle.speedY,
                    speedX: particle.speedX * 0.95,
                    speedY: particle.speedY * 0.95,
                    opacity: Math.max(0, particle.opacity - 0.03),
                    size: particle.size * 0.98,
                }))
            );

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [isAnimating, particles.length]);

    if (!isAnimating || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        opacity: particle.opacity,
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                    }}
                />
            ))}
        </div>
    );
}
