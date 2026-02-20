import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Black Hole: Event Horizon - MASTER CHALLENGE',
    description: '🏆 MASTER CHALLENGE: Escape the event horizon of a black hole! Learn about time dilation, Hawking radiation, and gravitational lensing. Unlock ALL planets!',
    keywords: ['Black hole game', 'event horizon', 'space game', 'time dilation', 'Hawking radiation', 'gravitational lensing', 'master challenge', 'physics game'],
    alternates: {
        canonical: 'https://orbitquest.games/games/blackhole',
    },
    openGraph: {
        title: 'Black Hole: Event Horizon',
        description: '🏆 Escape the event horizon! Master challenge unlocks ALL planets.',
        url: 'https://orbitquest.games/games/blackhole',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Black Hole - Event Horizon Master Challenge',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Black Hole: Event Horizon',
        description: '🏆 Escape the event horizon! Master challenge unlocks ALL planets.',
        images: ['/og-image.png'],
    },
};

export default function BlackHoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
