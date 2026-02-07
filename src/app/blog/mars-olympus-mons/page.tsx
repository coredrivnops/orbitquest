import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Olympus Mons: The Largest Volcano in Our Solar System - OrbitQuest',
    description: 'Explore Olympus Mons, Mars\' giant shield volcano standing nearly three times the height of Mount Everest. Learn why it grew so massive.',
    keywords: ['Olympus Mons', 'Mars volcano', 'largest volcano solar system', 'Mars facts', 'shield volcano', 'tallest mountain'],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How tall is Olympus Mons?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Olympus Mons stands approximately 21.9 kilometers (13.6 miles) high, making it nearly three times taller than Mount Everest (8.85 km). It is the tallest known volcano and mountain in our solar system."
            }
        },
        {
            "@type": "Question",
            "name": "Why is Olympus Mons so large?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Olympus Mons grew so large because Mars lacks plate tectonics. On Earth, moving tectonic plates carry volcanoes away from their magma source. On Mars, the volcanic hot spot remained stationary beneath Olympus Mons for billions of years, allowing continuous growth."
            }
        },
        {
            "@type": "Question",
            "name": "Is Olympus Mons still active?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Olympus Mons is classified as dormant rather than extinct. Based on crater counting and lava flow analysis, scientists believe it last erupted approximately 25 million years ago. Future eruptions are possible, though Mars appears volcanically quiet at present."
            }
        }
    ]
};

// Article Schema
const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Olympus Mons: The Largest Volcano in Our Solar System",
    "description": "Explore Olympus Mons, Mars' giant shield volcano standing nearly three times the height of Mount Everest.",
    "author": { "@type": "Organization", "name": "OrbitQuest" },
    "publisher": { "@type": "Organization", "name": "OrbitQuest", "url": "https://orbitquest.games" },
    "datePublished": "2026-01-01",
    "dateModified": "2026-01-18"
};

export default function OlympusMons() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <Header />

            <main className="flex-1 py-16">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="mb-8 text-sm">
                        <Link href="/" className="text-text-dim hover:text-neon-cyan">Home</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <Link href="/blog" className="text-text-dim hover:text-neon-cyan">Blog</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <span className="text-neon-cyan">Olympus Mons</span>
                    </nav>

                    <header className="mb-12 text-center">
                        <span className="text-7xl mb-4 block">🌋</span>
                        <h1 className="font-heading text-3xl md:text-4xl text-neon-cyan mb-4">
                            Olympus Mons: The Largest Volcano in Our Solar System
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-text-dim text-sm">
                            <span>January 2026</span>
                            <span>•</span>
                            <span>5 min read</span>
                        </div>
                    </header>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg text-text-secondary leading-relaxed mb-8">
                            Rising from the Martian surface like a colossal dome, Olympus Mons is
                            a volcano of truly planetary proportions. At nearly three times the
                            height of Mount Everest and roughly the size of France, it represents
                            the most extreme volcanic structure we know of anywhere in the cosmos.
                        </p>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Mind-Boggling Dimensions
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The statistics of Olympus Mons are almost incomprehensible:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="planet-card bg-red-900/20 p-4 text-center">
                                    <p className="text-3xl mb-2">📏</p>
                                    <p className="text-text-secondary text-sm">Height</p>
                                    <p className="text-neon-cyan font-bold text-xl">21.9 km</p>
                                    <p className="text-text-dim text-xs">(2.5x Mount Everest)</p>
                                </div>
                                <div className="planet-card bg-red-900/20 p-4 text-center">
                                    <p className="text-3xl mb-2">↔️</p>
                                    <p className="text-text-secondary text-sm">Diameter</p>
                                    <p className="text-neon-cyan font-bold text-xl">624 km</p>
                                    <p className="text-text-dim text-xs">(Size of France)</p>
                                </div>
                                <div className="planet-card bg-red-900/20 p-4 text-center">
                                    <p className="text-3xl mb-2">🕳️</p>
                                    <p className="text-text-secondary text-sm">Caldera Width</p>
                                    <p className="text-neon-cyan font-bold text-xl">80 km</p>
                                    <p className="text-text-dim text-xs">(Contains 6 craters)</p>
                                </div>
                                <div className="planet-card bg-red-900/20 p-4 text-center">
                                    <p className="text-3xl mb-2">🧗</p>
                                    <p className="text-text-secondary text-sm">Cliff Height</p>
                                    <p className="text-neon-cyan font-bold text-xl">6-8 km</p>
                                    <p className="text-text-dim text-xs">(Vertical escarpment)</p>
                                </div>
                            </div>
                            <p className="text-text-secondary leading-relaxed">
                                If you were standing at the base of Olympus Mons, the volcano would
                                extend so far in every direction that you couldn&apos;t see its edges -
                                it would disappear beyond the horizon due to Mars&apos;s curvature.
                            </p>
                        </section>

                        <div className="planet-card bg-gradient-to-r from-red-900/30 to-orange-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-orange-400 mb-2">🚀 Perspective Check</h3>
                            <p className="text-text-secondary">
                                Commercial aircraft on Earth typically cruise at 10-12 km altitude.
                                If Olympus Mons were on Earth, its summit would poke above the
                                cruising altitude of most planes. Climbing it would require
                                supplemental oxygen for nearly the entire ascent.
                            </p>
                        </div>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Why Is Olympus Mons So Massive?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The key to understanding Olympus Mons&apos;s extreme size lies in what
                                Mars <em>lacks</em>: <strong className="text-white">plate tectonics</strong>.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                On Earth, the crust is divided into moving plates. Volcanic hotspots
                                (like the one beneath Hawaii) remain stationary while the plate above
                                them moves. This creates chains of volcanoes, each active for only a
                                relatively brief geological period before being carried away from the
                                magma source.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Mars has no such plate movement. The Martian crust is a single,
                                stationary shell. This means the volcanic hotspot beneath Olympus
                                Mons has been feeding lava to the same location for billions of years,
                                allowing the volcano to grow to staggering proportions.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                Additionally, Mars&apos;s lower gravity (about 38% of Earth&apos;s) allows
                                volcanic structures to grow higher before collapsing under their own
                                weight.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                A Shield Volcano Like Hawaii
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Olympus Mons is classified as a <strong className="text-white">shield
                                    volcano</strong>, named because of its broad, gently sloping shape
                                resembling a warrior&apos;s shield lying on the ground.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Shield volcanoes form from eruptions of low-viscosity basaltic lava
                                that flows easily over long distances. This creates wide, shallow
                                slopes typically between 2° and 5°. Hawaii&apos;s Mauna Loa is Earth&apos;s
                                largest shield volcano, but Olympus Mons dwarfs it by every measure.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse mb-4">
                                    <thead>
                                        <tr className="border-b border-neon-cyan/30">
                                            <th className="text-left py-3 px-4 text-neon-cyan font-heading">Feature</th>
                                            <th className="text-left py-3 px-4 text-red-400 font-heading">Olympus Mons</th>
                                            <th className="text-left py-3 px-4 text-blue-400 font-heading">Mauna Loa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-text-secondary">
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Height (from base)</td>
                                            <td className="py-3 px-4">21.9 km</td>
                                            <td className="py-3 px-4">10.2 km</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Width</td>
                                            <td className="py-3 px-4">624 km</td>
                                            <td className="py-3 px-4">120 km</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4">Volume</td>
                                            <td className="py-3 px-4">~2.5 million km³</td>
                                            <td className="py-3 px-4">~75,000 km³</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Is Olympus Mons Still Active?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Scientists classify Olympus Mons as <strong className="text-white">dormant
                                    rather than extinct</strong>. Analysis of lava flows on its flanks
                                suggests the most recent eruption occurred approximately 25 million
                                years ago - recently in geological terms.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                This means future eruptions are theoretically possible, though Mars
                                shows no current signs of volcanic activity. If Olympus Mons were
                                to erupt again, the lava flows could extend hundreds of kilometers
                                across the Martian surface.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Dramatic Cliff Escarpment
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                One of Olympus Mons&apos;s most striking features is the massive cliff
                                that surrounds its base. This <strong className="text-white">escarpment
                                    rises 6 to 8 kilometers</strong> in many places - nearly as tall as
                                Mount Everest itself.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                Scientists believe this cliff formed through a combination of erosion
                                and collapse events. The sheer vertical walls make Olympus Mons
                                appear to sit on a raised platform, further emphasizing its
                                dominance over the surrounding terrain.
                            </p>
                        </section>

                        <section className="border-t border-white/10 pt-8 mb-12">
                            <h3 className="font-heading text-lg text-text-dim mb-4">Sources</h3>
                            <ul className="text-text-dim text-sm space-y-1">
                                <li>• NASA Mars Exploration - Olympus Mons</li>
                                <li>• ESA Mars Express - Volcanic Studies</li>
                                <li>• USGS Astrogeology - Mars Topography</li>
                            </ul>
                        </section>
                    </div>

                    <div className="planet-card bg-gradient-to-r from-red-900/30 to-orange-900/30 p-8 text-center">
                        <h3 className="font-heading text-xl text-neon-cyan mb-3">Explore the Martian Surface!</h3>
                        <p className="text-text-secondary mb-6">
                            Navigate the dusty terrain of Mars in our &quot;Rover Rush&quot; game and
                            experience the challenges of the Red Planet.
                        </p>
                        <Link href="/games/mars" className="btn-neon inline-block">
                            🔴 Play Mars: Rover Rush
                        </Link>
                    </div>

                    <div className="mt-12">
                        <h3 className="font-heading text-xl text-neon-purple mb-6">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/blog/venus-hottest-planet" className="planet-card hover:border-neon-cyan/60">
                                <span className="text-2xl mr-3">🔥</span>
                                <span className="text-text-secondary">Why Is Venus Hotter Than Mercury?</span>
                            </Link>
                            <Link href="/blog/saturn-rings-composition" className="planet-card hover:border-neon-cyan/60">
                                <span className="text-2xl mr-3">💍</span>
                                <span className="text-text-secondary">What Are Saturn&apos;s Rings Made Of?</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </>
    );
}
