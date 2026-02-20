import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Saturn: Ring Runner - Jump Across the Icy Rings',
    description: 'Leap across Saturn\'s iconic icy rings! Mind the gaps, avoid debris, and learn about ring composition and the Roche limit. Free educational space platformer.',
    keywords: ['Saturn game', 'saturn arcade', 'space game', 'saturn rings', 'ring composition', 'Roche limit', 'educational game', 'platformer'],
    alternates: {
        canonical: 'https://orbitquest.games/games/saturn',
    },
    openGraph: {
        title: 'Saturn: Ring Runner',
        description: 'Leap across Saturn\'s iconic icy rings!',
        url: 'https://orbitquest.games/games/saturn',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Saturn - Ring Runner Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Saturn: Ring Runner',
        description: 'Leap across Saturn\'s iconic icy rings!',
        images: ['/og-image.png'],
    },
};

export default function SaturnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
