import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Jupiter\'s Great Red Spot: A Storm Bigger Than Earth - OrbitQuest',
    description: 'Learn about Jupiter\'s Great Red Spot, the largest storm in our solar system. Discover how this 400-year-old hurricane works and why it\'s shrinking.',
    keywords: ['Jupiter Great Red Spot', 'Jupiter storm', 'largest storm solar system', 'Jupiter facts', 'gas giant', 'Jupiter atmosphere'],
    openGraph: {
        title: 'Jupiter\'s Great Red Spot: A Storm Bigger Than Earth',
        description: 'The most famous storm in our solar system has been raging for over 400 years.',
        type: 'article',
    },
};

// FAQ Schema for SEO
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How big is Jupiter's Great Red Spot?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Jupiter's Great Red Spot is so large that Earth could fit inside it. At its current size, it measures about 16,000 kilometers wide - roughly 1.3 times the diameter of Earth. Historically, it was even larger, capable of containing two or three Earths."
            }
        },
        {
            "@type": "Question",
            "name": "How old is the Great Red Spot?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Astronomers have been observing the Great Red Spot since at least 1665, making it over 400 years old. However, the storm may be even older as it existed before telescopes were powerful enough to observe it clearly."
            }
        },
        {
            "@type": "Question",
            "name": "Why is the Great Red Spot red?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Scientists believe the red color comes from chemical compounds in Jupiter's atmosphere being broken apart by ultraviolet light from the Sun. These broken molecules may include ammonia, acetylene, or phosphorus that create the distinctive reddish-brown color."
            }
        }
    ]
};

// Article Schema
const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Jupiter's Great Red Spot: A Storm Bigger Than Earth",
    "description": "Learn about the most famous storm in our solar system.",
    "author": { "@type": "Organization", "name": "OrbitQuest" },
    "publisher": { "@type": "Organization", "name": "OrbitQuest", "url": "https://orbitquest.games" },
    "datePublished": "2026-01-01",
    "dateModified": "2026-01-18"
};

export default function JupiterBlogPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

            <Header />

            <main className="flex-1 py-16">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8 text-sm">
                        <Link href="/" className="text-text-dim hover:text-neon-cyan">Home</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <Link href="/blog" className="text-text-dim hover:text-neon-cyan">Blog</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <span className="text-neon-cyan">Great Red Spot</span>
                    </nav>

                    {/* Header */}
                    <header className="mb-12 text-center">
                        <span className="text-7xl mb-4 block">🌪️</span>
                        <h1 className="font-heading text-3xl md:text-4xl text-neon-cyan mb-4">
                            Jupiter&apos;s Great Red Spot: A Storm Bigger Than Earth
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-text-dim text-sm">
                            <span>January 2026</span>
                            <span>•</span>
                            <span>6 min read</span>
                            <span>•</span>
                            <span>Planets</span>
                        </div>
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-invert max-w-none">

                        {/* Introduction */}
                        <p className="text-lg text-text-secondary leading-relaxed mb-8">
                            In the swirling clouds of Jupiter lies one of the most remarkable phenomena
                            in our solar system: the Great Red Spot. This colossal storm has been raging
                            for at least 400 years, witnessed by generations of astronomers since the
                            invention of the telescope. Today, it remains one of the most studied and
                            mysterious features of our solar system&apos;s largest planet.
                        </p>

                        {/* Section 1 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                An Unimaginable Scale
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                To truly appreciate the Great Red Spot, you must understand its
                                staggering size. At approximately <strong className="text-white">16,000 kilometers
                                    wide</strong>, the storm is wider than Earth itself. If you could drop
                                our entire planet into the Great Red Spot, Earth would fit inside with
                                room to spare.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Historically, the storm was even larger. In the 19th century,
                                observations suggested it may have been up to 40,000 kilometers wide -
                                large enough to contain two or three Earths side by side. The fact that
                                it has been shrinking raises fascinating questions about the dynamics
                                of giant planet atmospheres.
                            </p>
                        </section>

                        {/* Scale Comparison Box */}
                        <div className="planet-card bg-gradient-to-r from-orange-900/30 to-red-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-neon-cyan mb-4">📊 Size Comparison</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-space-deep/50 p-4 rounded-lg">
                                    <p className="text-3xl mb-2">🌍</p>
                                    <p className="text-text-secondary text-sm">Earth&apos;s Diameter</p>
                                    <p className="text-neon-cyan font-bold">12,742 km</p>
                                </div>
                                <div className="bg-space-deep/50 p-4 rounded-lg">
                                    <p className="text-3xl mb-2">🔴</p>
                                    <p className="text-text-secondary text-sm">Great Red Spot Width</p>
                                    <p className="text-orange-400 font-bold">~16,000 km</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                How the Storm Works
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The Great Red Spot is a <strong className="text-white">high-pressure
                                    anticyclonic storm</strong>. Unlike hurricanes on Earth which are
                                low-pressure systems, this storm is characterized by high atmospheric
                                pressure at its center.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Key characteristics of the storm include:
                            </p>
                            <ul className="space-y-3 text-text-secondary mb-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-400 text-xl">💨</span>
                                    <span>
                                        <strong className="text-white">Wind speeds up to 400 mph (644 km/h)</strong> -
                                        faster than any hurricane ever recorded on Earth
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-400 text-xl">🔄</span>
                                    <span>
                                        <strong className="text-white">Counterclockwise rotation</strong> with a
                                        complete rotation every 6 Earth days
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-400 text-xl">📍</span>
                                    <span>
                                        <strong className="text-white">Located at 22° south latitude</strong>,
                                        trapped between two of Jupiter&apos;s jet streams
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-400 text-xl">⬆️</span>
                                    <span>
                                        <strong className="text-white">Towers 8 km above surrounding clouds</strong>,
                                        creating a visible bulge in Jupiter&apos;s atmosphere
                                    </span>
                                </li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Mystery of Its Red Color
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Why is the Great Red Spot red? This question has puzzled scientists
                                for centuries. The most widely accepted theory involves chemical
                                reactions in Jupiter&apos;s upper atmosphere.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                According to research from NASA&apos;s Juno mission, the red color likely
                                comes from:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-text-secondary mb-4">
                                <li>Ammonia and acetylene rising to the top of the storm</li>
                                <li>Ultraviolet radiation from the Sun breaking apart these molecules</li>
                                <li>The resulting compounds creating reddish-brown chromophores</li>
                            </ol>
                            <p className="text-text-secondary leading-relaxed">
                                The higher altitude of the Great Red Spot means more exposure to UV
                                radiation, intensifying the color. Interestingly, the storm&apos;s hue
                                varies over time - sometimes appearing deep brick red, other times
                                a pale salmon color.
                            </p>
                        </section>

                        {/* Callout */}
                        <div className="planet-card bg-gradient-to-r from-red-900/30 to-orange-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-orange-400 mb-2">🔬 NASA Juno Discovery</h3>
                            <p className="text-text-secondary">
                                NASA&apos;s Juno spacecraft, which arrived at Jupiter in 2016, discovered
                                that the Great Red Spot extends surprisingly deep into Jupiter&apos;s
                                atmosphere - between 300 and 500 kilometers deep. This means the storm
                                has roots extending 50 to 100 times deeper than Earth&apos;s oceans.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Is the Great Red Spot Dying?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                One of the most significant observations of recent decades is that
                                the Great Red Spot appears to be shrinking. Historical records suggest:
                            </p>
                            <ul className="space-y-2 text-text-secondary mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-neon-cyan">•</span>
                                    <span>In the 1800s: approximately 40,000 km wide</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-neon-cyan">•</span>
                                    <span>In the 1970s: approximately 23,000 km wide (Voyager measurements)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-neon-cyan">•</span>
                                    <span>Today: approximately 16,000 km wide</span>
                                </li>
                            </ul>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                At this rate, some scientists initially predicted the storm could
                                become circular and eventually dissipate within 20 years. However,
                                more recent research suggests the shrinking may be slowing down, and
                                the storm could persist much longer.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                The truth is, we don&apos;t fully understand what feeds and maintains the
                                Great Red Spot, making predictions about its future uncertain.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Other Storms on Jupiter
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The Great Red Spot is not alone. Jupiter hosts numerous other storms:
                            </p>
                            <ul className="space-y-3 text-text-secondary">
                                <li className="flex items-start gap-3">
                                    <span className="text-white text-xl">⚪</span>
                                    <span>
                                        <strong className="text-white">Oval BA (&quot;Red Spot Jr.&quot;)</strong> -
                                        Formed in 2000 from three smaller white storms merging; has since
                                        turned reddish
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-white text-xl">⚪</span>
                                    <span>
                                        <strong className="text-white">White Ovals</strong> -
                                        Numerous smaller anticyclonic storms scattered across Jupiter&apos;s bands
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brown-400 text-xl">🟤</span>
                                    <span>
                                        <strong className="text-white">Brown Barges</strong> -
                                        Dark cyclonic storms that appear as brown streaks
                                    </span>
                                </li>
                            </ul>
                        </section>

                        {/* Conclusion */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Conclusion: A Window into Giant Planet Dynamics
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Jupiter&apos;s Great Red Spot is more than just a storm - it&apos;s a natural
                                laboratory for studying atmospheric dynamics on a scale impossible on
                                Earth. Its 400+ year existence challenges our understanding of what
                                makes storms form, persist, and evolve.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                As missions like NASA&apos;s Juno continue to study Jupiter, we&apos;re learning
                                more about this iconic feature. Whether the Great Red Spot will
                                eventually fade away or continue spinning for centuries more remains
                                one of planetary science&apos;s most fascinating open questions.
                            </p>
                        </section>

                        {/* Sources */}
                        <section className="border-t border-white/10 pt-8 mb-12">
                            <h3 className="font-heading text-lg text-text-dim mb-4">Sources</h3>
                            <ul className="text-text-dim text-sm space-y-1">
                                <li>• NASA Solar System Exploration - Jupiter Overview</li>
                                <li>• NASA Juno Mission - Great Red Spot Observations</li>
                                <li>• Geophysical Research Letters - Jupiter Atmospheric Studies</li>
                            </ul>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="planet-card bg-gradient-to-r from-orange-900/30 to-red-900/30 p-8 text-center">
                        <h3 className="font-heading text-xl text-neon-cyan mb-3">
                            Ride Through Jupiter&apos;s Storms!
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Experience the power of Jupiter&apos;s atmospheric bands in our
                            &quot;Storm Rider&quot; game. Dodge the Great Red Spot and navigate
                            through endless storms!
                        </p>
                        <Link href="/games/jupiter" className="btn-neon inline-block">
                            🌪️ Play Jupiter: Storm Rider
                        </Link>
                    </div>

                    {/* Related Articles */}
                    <div className="mt-12">
                        <h3 className="font-heading text-xl text-neon-purple mb-6">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/blog/why-is-neptune-blue" className="planet-card hover:border-neon-cyan/60 transition-colors">
                                <span className="text-2xl mr-3">🔵</span>
                                <span className="text-text-secondary hover:text-white transition-colors">
                                    Why Is Neptune Blue?
                                </span>
                            </Link>
                            <Link href="/blog/saturn-rings-composition" className="planet-card hover:border-neon-cyan/60 transition-colors">
                                <span className="text-2xl mr-3">💍</span>
                                <span className="text-text-secondary hover:text-white transition-colors">
                                    What Are Saturn&apos;s Rings Made Of?
                                </span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </>
    );
}
