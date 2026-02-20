import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Jupiter: Storm Rider - Navigate the Great Red Spot',
    description: 'Ride through Jupiter\'s atmospheric bands and dodge storms from the Great Red Spot! Collect moon power-ups and learn about the gas giant. Free space arcade game.',
    keywords: ['Jupiter game', 'jupiter arcade', 'space game', 'Great Red Spot', 'gas giant', 'jupiter moons', 'educational game', 'storm game'],
    alternates: {
        canonical: 'https://orbitquest.games/games/jupiter',
    },
    openGraph: {
        title: 'Jupiter: Storm Rider',
        description: 'Ride through Jupiter\'s atmospheric bands and dodge storms!',
        url: 'https://orbitquest.games/games/jupiter',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Jupiter - Storm Rider Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Jupiter: Storm Rider',
        description: 'Ride through Jupiter\'s atmospheric bands and dodge storms!',
        images: ['/og-image.png'],
    },
};

export default function JupiterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
