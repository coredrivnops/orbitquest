import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mercury: Solar Flare - Survive the Sun\'s Wrath',
    description: 'BONUS: The ultimate test! Survive extreme temperatures and solar flares on Mercury, the scorched frontier closest to the Sun. Hardest space challenge.',
    keywords: ['Mercury game', 'mercury arcade', 'space game', 'solar flares', 'extreme temperatures', 'closest to sun', 'educational game', 'ultimate challenge'],
    alternates: {
        canonical: 'https://orbitquest.games/games/mercury',
    },
    openGraph: {
        title: 'Mercury: Solar Flare',
        description: 'Survive extreme temperatures and solar flares on Mercury!',
        url: 'https://orbitquest.games/games/mercury',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Mercury - Solar Flare Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mercury: Solar Flare',
        description: 'Survive extreme temperatures and solar flares on Mercury!',
        images: ['/og-image.png'],
    },
};

export default function MercuryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
