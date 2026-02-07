import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // OrbitQuest Design System
                'space': {
                    'deep': '#050510',      // Deep Navy - Primary BG
                    'dark': '#0a0a1f',      // Darker variant
                    'medium': '#15152f',    // Medium variant
                },
                'neon': {
                    'cyan': '#00f0ff',      // Accent Neon Cyan
                    'purple': '#a855f7',    // Secondary accent
                    'pink': '#ec4899',      // Tertiary accent
                },
                'text': {
                    'primary': '#e0e0ff',   // Off-White
                    'secondary': '#a0a0c0', // Muted
                    'dim': '#606080',       // Dimmed
                },
            },
            fontFamily: {
                'heading': ['var(--font-orbitron)', 'sans-serif'],
                'ui': ['var(--font-rajdhani)', 'sans-serif'],
                'body': ['var(--font-inter)', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 20px currentColor',
                'neon-lg': '0 0 40px currentColor',
                'neon-cyan': '0 0 20px #00f0ff',
                'neon-purple': '0 0 20px #a855f7',
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'orbit': 'orbit 20s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'shooting-star': 'shooting-star 3s linear infinite',
                'twinkle': 'twinkle 4s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.6s ease-out forwards',
                'fade-in': 'fade-in 0.8s ease-out forwards',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
                    '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
                },
                'orbit': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'shooting-star': {
                    '0%': { transform: 'translateX(0) translateY(0)', opacity: '1' },
                    '70%': { opacity: '1' },
                    '100%': { transform: 'translateX(500px) translateY(300px)', opacity: '0' },
                },
                'twinkle': {
                    '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.2)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.6)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}

export default config
