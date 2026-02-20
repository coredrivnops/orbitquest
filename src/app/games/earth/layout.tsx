import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Earth: Orbital Balance - Kepler\'s Laws Space Game',
    description: 'Maintain stable orbit around Earth! Learn about orbital mechanics and Kepler\'s laws in this physics-based space game. Complete your epic journey home!',
    keywords: ['Earth game', 'orbital mechanics', 'space game', 'Kepler laws', 'orbit simulator', 'physics game', 'educational game', 'space physics'],
    alternates: {
        canonical: 'https://orbitquest.games/games/earth',
    },
    openGraph: {
        title: 'Earth: Orbital Balance',
        description: 'Maintain stable orbit around Earth! Learn orbital mechanics.',
        url: 'https://orbitquest.games/games/earth',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Earth - Orbital Balance Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Earth: Orbital Balance',
        description: 'Maintain stable orbit around Earth! Learn orbital mechanics.',
        images: ['/og-image.png'],
    },
};

export default function EarthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
