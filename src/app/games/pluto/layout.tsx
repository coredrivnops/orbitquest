import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pluto: Dwarf Dash - FREE Kuiper Belt Defense Game',
    description: 'FREE because it\'s not a planet! Defend Pluto and its moons from asteroids in this tower defense game. Learn about dwarf planets and the Kuiper Belt.',
    keywords: ['Pluto game', 'pluto arcade', 'space game', 'dwarf planet', 'Kuiper Belt', 'New Horizons', 'educational game', 'free game', 'tower defense'],
    alternates: {
        canonical: 'https://orbitquest.games/games/pluto',
    },
    openGraph: {
        title: 'Pluto: Dwarf Dash',
        description: 'FREE because it\'s not a planet! Defend Pluto from asteroids.',
        url: 'https://orbitquest.games/games/pluto',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Pluto - Dwarf Dash Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pluto: Dwarf Dash',
        description: 'FREE because it\'s not a planet! Defend Pluto from asteroids.',
        images: ['/og-image.png'],
    },
};

export default function PlutoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
