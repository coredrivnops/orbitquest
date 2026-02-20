import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'The Sun: Solar Showdown - FINAL BOSS Arcade Shooter',
    description: '☀️ FINAL BOSS: Defend the Sun from alien invasion! Epic arcade shooter with astronaut squadrons. Only for dedicated explorers who conquered every world.',
    keywords: ['Sun game', 'solar showdown', 'arcade shooter', 'space game', 'final boss', 'alien invasion', 'nuclear fusion', 'solar flares', 'space battle'],
    alternates: {
        canonical: 'https://orbitquest.games/games/sun',
    },
    openGraph: {
        title: 'The Sun: Solar Showdown',
        description: '☀️ FINAL BOSS: Defend the Sun from alien invasion!',
        url: 'https://orbitquest.games/games/sun',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'The Sun - Solar Showdown Final Boss',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'The Sun: Solar Showdown',
        description: '☀️ FINAL BOSS: Defend the Sun from alien invasion!',
        images: ['/og-image.png'],
    },
};

export default function SunLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
