import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mars: Rover Rush - Drive the Perseverance Rover',
    description: 'Drive the Perseverance rover across Mars! Collect samples, avoid meteors, and learn about Olympus Mons and rover missions. Free educational Mars game.',
    keywords: ['Mars game', 'mars arcade', 'space game', 'Perseverance rover', 'Olympus Mons', 'red planet', 'educational game', 'rover game'],
    alternates: {
        canonical: 'https://orbitquest.games/games/mars',
    },
    openGraph: {
        title: 'Mars: Rover Rush',
        description: 'Drive the Perseverance rover across Mars!',
        url: 'https://orbitquest.games/games/mars',
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Mars - Rover Rush Game',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mars: Rover Rush',
        description: 'Drive the Perseverance rover across Mars!',
        images: ['/og-image.png'],
    },
};

export default function MarsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
