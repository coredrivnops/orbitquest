import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Venus: Pressure Dive - Survive the Hellscape Planet',
    description: 'BONUS: Survive Venus\' crushing pressure and sulfuric acid clouds! Learn about runaway greenhouse effect on the hottest planet. Extreme space challenge.',
    keywords: ['Venus game', 'venus arcade', 'space game', 'greenhouse effect', 'sulfuric acid', 'hottest planet', 'educational game', 'extreme challenge'],
    alternates: {
        canonical: 'https://orbitquest.games/games/venus',
    },
    openGraph: {
        title: 'Venus: Pressure Dive',
        description: 'Survive Venus\' crushing pressure and sulfuric acid clouds!',
        url: 'https://orbitquest.games/games/venus',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Venus - Pressure Dive Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Venus: Pressure Dive',
        description: 'Survive Venus\' crushing pressure and sulfuric acid clouds!',
        images: ['/og-image.png'],
    },
};

export default function VenusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
