import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MissionControl from '@/components/MissionControl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'OrbitQuest - Free Space Arcade Games | Learn About the Solar System',
    description: 'Play 10 free space-themed arcade games while learning about planets, orbital mechanics, and the wonders of our solar system. Start your journey from Neptune to Earth!',
    keywords: 'space games, free online games, solar system games, educational games, planet games, arcade games, science games for kids',
    openGraph: {
        title: 'OrbitQuest - Free Space Arcade Games',
        description: 'Navigate through 10 planets in this free educational space arcade.',
        type: 'website',
    },
};

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <MissionControl />
            </main>
            <Footer />
        </div>
    );
}
