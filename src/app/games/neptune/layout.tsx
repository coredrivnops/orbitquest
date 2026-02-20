import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Neptune: Deep Dive - Supersonic Wind Tunnel Game',
    description: 'Navigate Neptune\'s supersonic winds at 2,000 km/h! Dodge obstacles, collect diamonds, and learn about the ice giant\'s Great Dark Spot. Free educational space game.',
    keywords: ['Neptune game', 'neptune arcade', 'space game', 'supersonic winds', 'ice giant', 'Great Dark Spot', 'educational game', 'free browser game'],
    alternates: {
        canonical: 'https://orbitquest.games/games/neptune',
    },
    openGraph: {
        title: 'Neptune: Deep Dive',
        description: 'Navigate Neptune\'s supersonic winds at 2,000 km/h!',
        url: 'https://orbitquest.games/games/neptune',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Neptune - Deep Dive Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Neptune: Deep Dive',
        description: 'Navigate Neptune\'s supersonic winds at 2,000 km/h!',
        images: ['/og-image.png'],
    },
};

export default function NeptuneLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
