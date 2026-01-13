'use client';

import { useEffect, useState } from 'react';
import { getStardustBalance } from '@/lib/localStorage';

interface StardustCounterProps {
    className?: string;
}

export default function StardustCounter({ className = '' }: StardustCounterProps) {
    const [stardust, setStardust] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Load initial balance
        setStardust(getStardustBalance());

        // Listen for custom events when stardust changes
        const handleUpdate = (e: CustomEvent<{ amount: number }>) => {
            setIsAnimating(true);
            setStardust(prev => prev + e.detail.amount);
            setTimeout(() => setIsAnimating(false), 500);
        };

        window.addEventListener('stardust-earned', handleUpdate as EventListener);
        return () => window.removeEventListener('stardust-earned', handleUpdate as EventListener);
    }, []);

    // Format number with commas
    const formatNumber = (num: number): string => {
        return num.toLocaleString();
    };

    return (
        <div className={`stardust-counter ${className}`}>
            <span className="text-2xl" role="img" aria-label="Stardust">
                ✨
            </span>
            <span
                className={`font-heading text-lg font-bold text-neon-cyan transition-transform duration-300 ${isAnimating ? 'scale-125' : 'scale-100'
                    }`}
            >
                {formatNumber(stardust)}
            </span>
            <span className="text-text-secondary font-ui text-sm">Stardust</span>
        </div>
    );
}
