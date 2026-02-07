'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(
    options: ScrollRevealOptions = {}
): [React.RefObject<T>, boolean] {
    const {
        threshold = 0.1,
        rootMargin = '0px 0px -50px 0px',
        triggerOnce = true,
    } = options;

    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isVisible];
}

// Pre-built animation classes
export const scrollRevealVariants = {
    fadeUp: {
        hidden: 'opacity-0 translate-y-8',
        visible: 'opacity-100 translate-y-0',
    },
    fadeDown: {
        hidden: 'opacity-0 -translate-y-8',
        visible: 'opacity-100 translate-y-0',
    },
    fadeLeft: {
        hidden: 'opacity-0 translate-x-8',
        visible: 'opacity-100 translate-x-0',
    },
    fadeRight: {
        hidden: 'opacity-0 -translate-x-8',
        visible: 'opacity-100 translate-x-0',
    },
    scale: {
        hidden: 'opacity-0 scale-90',
        visible: 'opacity-100 scale-100',
    },
    fadeIn: {
        hidden: 'opacity-0',
        visible: 'opacity-100',
    },
};
