import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Uranus: Polar Night - Red Light Green Light Space Game',
    description: 'Experience Uranus\' extreme 42-year seasons! Move during Summer, freeze during Winter in this Red Light Green Light space adventure. Learn about the tilted ice giant.',
    keywords: ['Uranus game', 'uranus arcade', 'space game', 'polar night', 'ice giant', '98 degree tilt', 'educational game', 'red light green light'],
    alternates: {
        canonical: 'https://orbitquest.games/games/uranus',
    },
    openGraph: {
        title: 'Uranus: Polar Night',
        description: 'Experience Uranus\' extreme 42-year seasons!',
        url: 'https://orbitquest.games/games/uranus',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Uranus - Polar Night Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Uranus: Polar Night',
        description: 'Experience Uranus\' extreme 42-year seasons!',
        images: ['/og-image.png'],
    },
};

export default function UranusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
