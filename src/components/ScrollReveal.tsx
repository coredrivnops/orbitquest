'use client';

import { ReactNode } from 'react';
import { useScrollReveal, scrollRevealVariants } from '@/hooks/useScrollReveal';

type AnimationVariant = keyof typeof scrollRevealVariants;

interface ScrollRevealProps {
    children: ReactNode;
    variant?: AnimationVariant;
    delay?: number;
    duration?: number;
    className?: string;
}

export default function ScrollReveal({
    children,
    variant = 'fadeUp',
    delay = 0,
    duration = 700,
    className = '',
}: ScrollRevealProps) {
    const [ref, isVisible] = useScrollReveal<HTMLDivElement>();
    const { hidden, visible } = scrollRevealVariants[variant];

    return (
        <div
            ref={ref}
            className={`transition-all ${className} ${isVisible ? visible : hidden}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            {children}
        </div>
    );
}

// Staggered reveal for lists/grids
interface StaggeredRevealProps {
    children: ReactNode[];
    variant?: AnimationVariant;
    staggerDelay?: number;
    duration?: number;
    className?: string;
    itemClassName?: string;
}

export function StaggeredReveal({
    children,
    variant = 'fadeUp',
    staggerDelay = 100,
    duration = 600,
    className = '',
    itemClassName = '',
}: StaggeredRevealProps) {
    const [ref, isVisible] = useScrollReveal<HTMLDivElement>();
    const { hidden, visible } = scrollRevealVariants[variant];

    return (
        <div ref={ref} className={className}>
            {children.map((child, index) => (
                <div
                    key={index}
                    className={`transition-all ${itemClassName} ${isVisible ? visible : hidden}`}
                    style={{
                        transitionDuration: `${duration}ms`,
                        transitionDelay: `${isVisible ? index * staggerDelay : 0}ms`,
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}

