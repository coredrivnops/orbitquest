import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'What Are Saturn\'s Rings Made Of? Ice, Rock, and Mystery - OrbitQuest',
    description: 'Discover the composition and origin of Saturn\'s iconic rings. Learn about ice particles, ring gaps, and the Cassini mission\'s discoveries.',
    keywords: ['Saturn rings composition', 'what are Saturn rings made of', 'Saturn facts', 'Cassini mission', 'ice particles', 'ring system'],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What are Saturn's rings made of?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Saturn's rings are made primarily of water ice particles, ranging from tiny grains to chunks as large as houses. They also contain rocky debris and dust. The rings are about 95% water ice with traces of tholin compounds that give some rings a reddish color."
            }
        },
        {
            "@type": "Question",
            "name": "How old are Saturn's rings?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Based on data from NASA's Cassini mission, Saturn's rings appear to be surprisingly young - between 100 million and 400 million years old. This means the rings formed long after the dinosaurs lived on Earth, and may have been witnessed by early life forms."
            }
        }
    ]
};

// Article Schema
const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Are Saturn's Rings Made Of? Ice, Rock, and Mystery",
    "description": "Discover the composition and origin of Saturn's iconic rings.",
    "author": { "@type": "Organization", "name": "OrbitQuest" },
    "publisher": { "@type": "Organization", "name": "OrbitQuest", "url": "https://orbitquest.games" },
    "datePublished": "2026-01-01",
    "dateModified": "2026-01-18"
};

export default function SaturnRingsBlog() {
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
                        <span className="text-neon-cyan">Saturn&apos;s Rings</span>
                    </nav>

                    <header className="mb-12 text-center">
                        <span className="text-7xl mb-4 block">💍</span>
                        <h1 className="font-heading text-3xl md:text-4xl text-neon-cyan mb-4">
                            What Are Saturn&apos;s Rings Made Of? Ice, Rock, and Mystery
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-text-dim text-sm">
                            <span>January 2026</span>
                            <span>•</span>
                            <span>5 min read</span>
                        </div>
                    </header>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg text-text-secondary leading-relaxed mb-8">
                            Saturn&apos;s rings are one of the most recognizable features in our solar
                            system. These magnificent bands of material stretch over 280,000 kilometers
                            from edge to edge, yet they are remarkably thin - averaging only about
                            10 meters thick. What exactly creates this stunning display?
                        </p>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Ice and Rock Composition
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Saturn&apos;s rings are composed primarily of <strong className="text-white">water
                                    ice particles</strong>. NASA&apos;s Cassini mission, which studied Saturn from
                                2004 to 2017, confirmed that the rings are approximately 95% water ice
                                with small amounts of rocky debris and dust.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The ice particles range dramatically in size:
                            </p>
                            <ul className="space-y-2 text-text-secondary mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-neon-cyan">❄️</span>
                                    <span>Microscopic ice grains (smaller than a grain of sand)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-neon-cyan">🧊</span>
                                    <span>Ice pebbles and chunks (centimeters to meters across)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-neon-cyan">🏠</span>
                                    <span>Ice boulders as large as houses or small buildings</span>
                                </li>
                            </ul>
                        </section>

                        <div className="planet-card bg-gradient-to-r from-yellow-900/30 to-orange-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-neon-cyan mb-2">🛸 Cassini Discovery</h3>
                            <p className="text-text-secondary">
                                The Cassini spacecraft flew through the gap between Saturn and its
                                innermost ring during its final orbits. It discovered that the rings
                                are &quot;raining&quot; material onto Saturn - about 10,000 kilograms of ice
                                per second fall into the planet&apos;s atmosphere!
                            </p>
                        </div>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Major Ring Groups
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Saturn&apos;s ring system is divided into several major sections, named
                                alphabetically in the order they were discovered:
                            </p>
                            <div className="space-y-4 mb-4">
                                <div className="planet-card bg-gray-800/30 p-4">
                                    <h4 className="text-white font-bold mb-1">D Ring (Innermost)</h4>
                                    <p className="text-text-secondary text-sm">Very faint, closest to Saturn</p>
                                </div>
                                <div className="planet-card bg-gray-700/30 p-4">
                                    <h4 className="text-white font-bold mb-1">C Ring (&quot;Crepe Ring&quot;)</h4>
                                    <p className="text-text-secondary text-sm">Broad but faint, partially transparent</p>
                                </div>
                                <div className="planet-card bg-gray-200/20 p-4">
                                    <h4 className="text-neon-cyan font-bold mb-1">B Ring (Brightest)</h4>
                                    <p className="text-text-secondary text-sm">The brightest and most massive ring</p>
                                </div>
                                <div className="planet-card bg-gray-800/30 p-4">
                                    <h4 className="text-white font-bold mb-1">Cassini Division</h4>
                                    <p className="text-text-secondary text-sm">4,800 km gap created by moon Mimas&apos;s gravity</p>
                                </div>
                                <div className="planet-card bg-gray-400/20 p-4">
                                    <h4 className="text-white font-bold mb-1">A Ring (Outermost bright ring)</h4>
                                    <p className="text-text-secondary text-sm">Contains the Encke and Keeler gaps</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Surprising Youth of Saturn&apos;s Rings
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                One of Cassini&apos;s most surprising discoveries was that Saturn&apos;s rings
                                appear to be relatively young - only <strong className="text-white">100 to
                                    400 million years old</strong>. This is remarkable because Saturn itself
                                formed 4.5 billion years ago with the rest of the solar system.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Scientists determined this by measuring the &quot;purity&quot; of the ice. If
                                the rings were billions of years old, they would have accumulated
                                significant amounts of dust and debris, darkening them considerably.
                                The brightness of the rings suggests they are relatively fresh.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                This means the rings formed long after dinosaurs walked on Earth, and
                                early mammals may have been around when Saturn acquired its iconic accessory.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                How Did the Rings Form?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The origin of Saturn&apos;s rings remains debated. Leading theories include:
                            </p>
                            <ul className="space-y-3 text-text-secondary">
                                <li className="flex items-start gap-3">
                                    <span className="text-xl">💥</span>
                                    <span><strong className="text-white">Shattered Moon:</strong> A comet or
                                        asteroid collided with one of Saturn&apos;s ice moons, breaking it apart</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-xl">🌙</span>
                                    <span><strong className="text-white">Tidal Destruction:</strong> A moon
                                        wandered too close to Saturn and was torn apart by tidal forces</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-xl">☄️</span>
                                    <span><strong className="text-white">Captured Comet:</strong> Saturn&apos;s
                                        gravity captured and shredded a passing icy object</span>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Will Saturn&apos;s Rings Disappear?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The same research that revealed the rings&apos; youth also suggests their
                                eventual fate: they are slowly disappearing. The &quot;ring rain&quot; phenomenon
                                means material is constantly falling into Saturn.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                At the current rate, scientists estimate the rings could be gone within
                                <strong className="text-white"> 100 million to 300 million years</strong>.
                                In cosmic terms, we are fortunate to exist during a time when Saturn
                                displays its magnificent rings.
                            </p>
                        </section>

                        <section className="border-t border-white/10 pt-8 mb-12">
                            <h3 className="font-heading text-lg text-text-dim mb-4">Sources</h3>
                            <ul className="text-text-dim text-sm space-y-1">
                                <li>• NASA Cassini Mission - Ring Observations</li>
                                <li>• NASA Solar System Exploration - Saturn</li>
                                <li>• Science Journal - Saturn Ring Age Studies</li>
                            </ul>
                        </section>
                    </div>

                    <div className="planet-card bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-8 text-center">
                        <h3 className="font-heading text-xl text-neon-cyan mb-3">Jump Across Saturn&apos;s Rings!</h3>
                        <p className="text-text-secondary mb-6">
                            Experience the ring system in our &quot;Ring Runner&quot; game - hop across
                            ice platforms in Saturn&apos;s low gravity!
                        </p>
                        <Link href="/games/saturn" className="btn-neon inline-block">
                            💍 Play Saturn: Ring Runner
                        </Link>
                    </div>

                    <div className="mt-12">
                        <h3 className="font-heading text-xl text-neon-purple mb-6">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/blog/jupiter-great-red-spot" className="planet-card hover:border-neon-cyan/60">
                                <span className="text-2xl mr-3">🌪️</span>
                                <span className="text-text-secondary">Jupiter&apos;s Great Red Spot</span>
                            </Link>
                            <Link href="/blog/mars-olympus-mons" className="planet-card hover:border-neon-cyan/60">
                                <span className="text-2xl mr-3">🌋</span>
                                <span className="text-text-secondary">Olympus Mons: Largest Volcano</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </>
    );
}
