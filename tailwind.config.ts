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
            },
        },
    },
    plugins: [],
}

export default config
