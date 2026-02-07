import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Space Learning Blog - OrbitQuest',
    description: 'Explore fascinating facts about our solar system, planets, space exploration, and astronomy. Educational articles about Neptune, Jupiter, Mars, and more.',
    keywords: ['space blog', 'astronomy facts', 'planet facts', 'solar system education', 'learn about planets'],
};

// Blog post data
const blogPosts = [
    {
        slug: 'why-is-neptune-blue',
        title: 'Why Is Neptune Blue? The Science Behind the Ice Giant\'s Color',
        excerpt: 'Discover why Neptune appears as a brilliant blue jewel in our solar system, and what makes it different from its neighbor Uranus.',
        date: 'January 2026',
        readTime: '5 min read',
        category: 'Planets',
        emoji: '🔵',
    },
    {
        slug: 'jupiter-great-red-spot',
        title: 'Jupiter\'s Great Red Spot: A Storm Bigger Than Earth',
        excerpt: 'Learn about the most famous storm in our solar system - a hurricane that has been raging for over 400 years.',
        date: 'January 2026',
        readTime: '6 min read',
        category: 'Planets',
        emoji: '🌪️',
    },
    {
        slug: 'saturn-rings-composition',
        title: 'What Are Saturn\'s Rings Made Of? Ice, Rock, and Mystery',
        excerpt: 'Explore the composition and origin of Saturn\'s iconic rings - from ice particles to ancient moons.',
        date: 'January 2026',
        readTime: '5 min read',
        category: 'Planets',
        emoji: '💍',
    },
    {
        slug: 'mars-olympus-mons',
        title: 'Olympus Mons: The Largest Volcano in Our Solar System',
        excerpt: 'Standing nearly three times the height of Mount Everest, Mars hosts a volcano that defies imagination.',
        date: 'January 2026',
        readTime: '5 min read',
        category: 'Planets',
        emoji: '🌋',
    },
    {
        slug: 'venus-hottest-planet',
        title: 'Why Is Venus Hotter Than Mercury? The Runaway Greenhouse Effect',
        excerpt: 'Despite being further from the Sun, Venus is the hottest planet. Learn why this happened and what it means for Earth.',
        date: 'January 2026',
        readTime: '6 min read',
        category: 'Planets',
        emoji: '🔥',
    },
];

export default function BlogPage() {
    return (
        <>
            <Header />

            <main className="flex-1 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="font-heading text-4xl md:text-5xl text-neon-cyan mb-4">
                            Space Learning Blog
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Explore fascinating facts about our solar system. Each article is
                            researched from NASA and ESA sources to bring you accurate,
                            educational content about the cosmos.
                        </p>
                    </div>

                    {/* Featured Post */}
                    <Link
                        href={`/blog/${blogPosts[0].slug}`}
                        className="block mb-12 group"
                    >
                        <article className="planet-card bg-gradient-to-br from-blue-900/40 to-cyan-900/20 p-8 hover:border-neon-cyan/60 transition-all duration-300">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                                    {blogPosts[0].emoji}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <span className="text-neon-cyan text-sm uppercase tracking-wider">Featured Article</span>
                                    <h2 className="font-heading text-2xl md:text-3xl text-white mt-2 mb-3 group-hover:text-neon-cyan transition-colors">
                                        {blogPosts[0].title}
                                    </h2>
                                    <p className="text-text-secondary mb-4">
                                        {blogPosts[0].excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 justify-center md:justify-start text-text-dim text-sm">
                                        <span>{blogPosts[0].date}</span>
                                        <span>•</span>
                                        <span>{blogPosts[0].readTime}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>

                    {/* Blog Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blogPosts.slice(1).map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group"
                            >
                                <article className="planet-card h-full hover:border-neon-purple/60 transition-all duration-300 hover:scale-[1.02]">
                                    <div className="flex items-start gap-4">
                                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                            {post.emoji}
                                        </span>
                                        <div className="flex-1">
                                            <span className="text-neon-purple text-xs uppercase tracking-wider">
                                                {post.category}
                                            </span>
                                            <h3 className="font-heading text-lg text-white mt-1 mb-2 group-hover:text-neon-cyan transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center gap-3 text-text-dim text-xs">
                                                <span>{post.date}</span>
                                                <span>•</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-16 text-center">
                        <div className="planet-card bg-gradient-to-r from-purple-900/30 to-cyan-900/30 p-8">
                            <h2 className="font-heading text-2xl text-neon-cyan mb-4">
                                Learn Through Play
                            </h2>
                            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
                                Want to experience these planets firsthand? Our arcade games
                                bring educational content to life through interactive gameplay.
                            </p>
                            <Link
                                href="/"
                                className="btn-neon inline-block"
                            >
                                🚀 Explore the Solar System
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
