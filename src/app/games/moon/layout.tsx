import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Moon: Lunar Lander - Apollo Landing Simulator',
    description: 'Land safely on the Moon! Master lunar gravity and avoid craters in this Apollo-inspired landing simulator. Learn about tidal locking and lunar phases.',
    keywords: ['Moon game', 'lunar lander', 'space game', 'Apollo missions', 'moon landing', 'tidal locking', 'educational game', 'landing simulator'],
    alternates: {
        canonical: 'https://orbitquest.games/games/moon',
    },
    openGraph: {
        title: 'Moon: Lunar Lander',
        description: 'Land safely on the Moon! Master lunar gravity.',
        url: 'https://orbitquest.games/games/moon',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Moon - Lunar Lander Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Moon: Lunar Lander',
        description: 'Land safely on the Moon! Master lunar gravity.',
        images: ['/og-image.png'],
    },
};

export default function MoonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
