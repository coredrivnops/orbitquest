import { Metadata } from 'next';

const siteUrl = 'https://orbitquest.games';

interface GameMetadataProps {
    planetId: string;
    planetName: string;
    gameName: string;
    description: string;
    keywords?: string[];
}

export function generateGameMetadata({
    planetId,
    planetName,
    gameName,
    description,
    keywords = [],
}: GameMetadataProps): Metadata {
    const title = `${planetName}: ${gameName}`;
    const url = `${siteUrl}/games/${planetId}`;

    const defaultKeywords = [
        `${planetName} game`,
        `${planetName.toLowerCase()} arcade`,
        'space game',
        'solar system game',
        'educational game',
        'free browser game',
        'astronomy game',
    ];

    return {
        title,
        description,
        keywords: [...defaultKeywords, ...keywords],
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: 'OrbitQuest',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: `${planetName} - ${gameName}`,
                },
            ],
            type: 'website',
            locale: 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}
