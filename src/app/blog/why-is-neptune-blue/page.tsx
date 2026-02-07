import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Why Is Neptune Blue? The Science Behind the Ice Giant\'s Color',
    description: 'Discover why Neptune appears as a brilliant blue jewel in our solar system. Learn about methane absorption, atmospheric composition, and how Neptune differs from Uranus.',
    keywords: ['Neptune blue color', 'why is Neptune blue', 'Neptune atmosphere', 'ice giant', 'methane absorption', 'Neptune facts'],
    openGraph: {
        title: 'Why Is Neptune Blue? The Science Behind the Ice Giant\'s Color',
        description: 'Discover why Neptune appears as a brilliant blue jewel in our solar system.',
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
            "name": "Why is Neptune blue?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Neptune appears blue because methane in its atmosphere absorbs red light from the Sun and reflects blue light back into space. The methane gas acts as a natural filter, removing red wavelengths and allowing only blue wavelengths to reach our eyes."
            }
        },
        {
            "@type": "Question",
            "name": "Is Neptune bluer than Uranus?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Neptune appears more vividly blue than Uranus, even though both planets have similar amounts of methane. Scientists believe an unknown compound in Neptune's atmosphere enhances its blue color, though this mystery remains unsolved."
            }
        },
        {
            "@type": "Question",
            "name": "What is Neptune made of?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Neptune is classified as an 'ice giant' composed primarily of hydrogen, helium, and methane gases in its atmosphere, with a core of rock and ice. The 'ice' refers to water, ammonia, and methane in a dense, hot, slushy state under extreme pressure."
            }
        }
    ]
};

// Article Schema for SEO
const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Why Is Neptune Blue? The Science Behind the Ice Giant's Color",
    "description": "Discover why Neptune appears as a brilliant blue jewel in our solar system.",
    "author": {
        "@type": "Organization",
        "name": "OrbitQuest"
    },
    "publisher": {
        "@type": "Organization",
        "name": "OrbitQuest",
        "url": "https://orbitquest.coredrivn.com"
    },
    "datePublished": "2026-01-01",
    "dateModified": "2026-01-18"
};

export default function NeptuneBlueBlog() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <Header />

            <main className="flex-1 py-16">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8 text-sm">
                        <Link href="/" className="text-text-dim hover:text-neon-cyan">Home</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <Link href="/blog" className="text-text-dim hover:text-neon-cyan">Blog</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <span className="text-neon-cyan">Neptune&apos;s Blue Color</span>
                    </nav>

                    {/* Header */}
                    <header className="mb-12 text-center">
                        <span className="text-7xl mb-4 block">🔵</span>
                        <h1 className="font-heading text-3xl md:text-4xl text-neon-cyan mb-4">
                            Why Is Neptune Blue? The Science Behind the Ice Giant&apos;s Color
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-text-dim text-sm">
                            <span>January 2026</span>
                            <span>•</span>
                            <span>5 min read</span>
                            <span>•</span>
                            <span>Planets</span>
                        </div>
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-invert max-w-none">

                        {/* Introduction */}
                        <p className="text-lg text-text-secondary leading-relaxed mb-8">
                            When the Voyager 2 spacecraft flew past Neptune in 1989, it revealed a world
                            of stunning azure beauty. Neptune&apos;s vivid blue color immediately captured
                            the imagination of scientists and the public alike. But what gives this
                            distant ice giant its distinctive hue? The answer lies in the planet&apos;s
                            unique atmospheric chemistry.
                        </p>

                        {/* Main Content Section 1 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Role of Methane in Neptune&apos;s Atmosphere
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Neptune&apos;s blue color is primarily caused by <strong className="text-white">methane gas (CH₄)</strong> in
                                its atmosphere. Methane makes up approximately 2-3% of Neptune&apos;s
                                atmospheric composition, with the rest being mostly hydrogen and helium.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Here&apos;s how the process works: When sunlight reaches Neptune after its
                                4.5-billion-kilometer journey from the Sun, it contains all colors of the
                                visible spectrum. As this light passes through Neptune&apos;s atmosphere:
                            </p>
                            <ul className="space-y-2 text-text-secondary mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">●</span>
                                    <span><strong className="text-white">Red light</strong> is absorbed by methane molecules and converted to heat</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400">●</span>
                                    <span><strong className="text-white">Orange light</strong> is also absorbed by methane</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400">●</span>
                                    <span><strong className="text-white">Blue light</strong> is scattered and reflected back into space</span>
                                </li>
                            </ul>
                            <p className="text-text-secondary leading-relaxed">
                                This selective absorption means that only blue wavelengths escape the
                                atmosphere and travel back to observers on Earth, giving Neptune its
                                characteristic azure appearance.
                            </p>
                        </section>

                        {/* Callout Box */}
                        <div className="planet-card bg-gradient-to-r from-blue-900/40 to-cyan-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-neon-cyan mb-2">🔬 Scientific Fact</h3>
                            <p className="text-text-secondary">
                                Methane absorbs light at wavelengths longer than 600 nanometers (the
                                red-orange part of the spectrum). This is the same compound found in
                                natural gas on Earth, though on Neptune it exists under vastly different
                                temperature and pressure conditions.
                            </p>
                        </div>

                        {/* Main Content Section 2 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Neptune-Uranus Mystery: Why Different Blues?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Both Neptune and its neighbor Uranus contain similar amounts of methane
                                in their atmospheres. However, Neptune appears as a much more vivid,
                                deeper blue compared to the pale cyan of Uranus. This has puzzled
                                scientists for decades.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                According to research from NASA and ESA, scientists believe that an
                                <strong className="text-white"> unknown atmospheric component</strong> exists on Neptune that
                                enhances its blue coloration. This mystery compound absorbs even more
                                red light than methane alone, intensifying the blue hue.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                The exact nature of this compound remains one of Neptune&apos;s unsolved
                                mysteries. Some theories suggest it could be a form of haze or aerosol
                                particles unique to Neptune&apos;s atmospheric chemistry.
                            </p>
                        </section>

                        {/* Comparison Table */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Neptune vs. Uranus: A Tale of Two Ice Giants
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-neon-cyan/30">
                                            <th className="text-left py-3 px-4 text-neon-cyan font-heading">Feature</th>
                                            <th className="text-left py-3 px-4 text-blue-400 font-heading">Neptune</th>
                                            <th className="text-left py-3 px-4 text-cyan-300 font-heading">Uranus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-text-secondary">
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Color</td>
                                            <td className="py-3 px-4">Deep azure blue</td>
                                            <td className="py-3 px-4">Pale cyan/greenish</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Methane content</td>
                                            <td className="py-3 px-4">~2-3%</td>
                                            <td className="py-3 px-4">~2-3%</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Distance from Sun</td>
                                            <td className="py-3 px-4">4.5 billion km</td>
                                            <td className="py-3 px-4">2.9 billion km</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4">Unknown blue enhancer</td>
                                            <td className="py-3 px-4">Present</td>
                                            <td className="py-3 px-4">Absent</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Main Content Section 3 */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                What Makes Neptune an &quot;Ice Giant&quot;?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Neptune is classified as an &quot;ice giant&quot; rather than a gas giant like
                                Jupiter or Saturn. Despite the name, Neptune isn&apos;t covered in frozen ice.
                                The term refers to the planet&apos;s composition of &quot;ices&quot; - water, ammonia,
                                and methane - which exist in a dense, hot, slushy state under extreme pressure.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Neptune&apos;s internal structure consists of:
                            </p>
                            <ul className="space-y-2 text-text-secondary mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-neon-cyan">🌊</span>
                                    <span>A thin outer atmosphere of hydrogen, helium, and methane</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400">💧</span>
                                    <span>A thick layer of &quot;hot ice&quot; - water, ammonia, and methane under pressure</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">🪨</span>
                                    <span>A rocky core about the size of Earth</span>
                                </li>
                            </ul>
                        </section>

                        {/* Interesting Fact Callout */}
                        <div className="planet-card bg-gradient-to-r from-purple-900/40 to-blue-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-neon-purple mb-2">💎 Diamond Rain on Neptune</h3>
                            <p className="text-text-secondary">
                                The extreme pressure deep within Neptune may cause methane molecules to
                                break apart, releasing carbon atoms that crystallize into diamonds.
                                Scientists believe it may literally rain diamonds on Neptune, with these
                                precious gems sinking toward the planet&apos;s core.
                            </p>
                        </div>

                        {/* Conclusion */}
                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Conclusion: A Blue Jewel in Our Solar System
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Neptune&apos;s stunning blue color is the result of methane gas absorbing red
                                light and reflecting blue wavelengths back into space. While this explains
                                the basic mechanism, the planet&apos;s particularly vivid shade of blue compared
                                to Uranus remains partially mysterious.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                As future missions to the outer solar system are planned, scientists hope
                                to unlock more of Neptune&apos;s atmospheric secrets. For now, this distant ice
                                giant continues to inspire wonder as one of the most beautiful objects in
                                our cosmic neighborhood.
                            </p>
                        </section>

                        {/* Sources */}
                        <section className="border-t border-white/10 pt-8 mb-12">
                            <h3 className="font-heading text-lg text-text-dim mb-4">Sources</h3>
                            <ul className="text-text-dim text-sm space-y-1">
                                <li>• NASA Solar System Exploration - Neptune Overview</li>
                                <li>• European Space Agency - Voyager 2 Neptune Flyby</li>
                                <li>• Journal of Geophysical Research: Planets - Neptune Atmospheric Composition</li>
                            </ul>
                        </section>

                    </div>

                    {/* CTA Section */}
                    <div className="planet-card bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-8 text-center">
                        <h3 className="font-heading text-xl text-neon-cyan mb-3">
                            Experience Neptune in OrbitQuest!
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Surf Neptune&apos;s supersonic winds in our &quot;Mach Surfer&quot; game and
                            experience the fastest winds in the solar system firsthand.
                        </p>
                        <Link
                            href="/games/neptune"
                            className="btn-neon inline-block"
                        >
                            🌊 Play Neptune: Mach Surfer
                        </Link>
                    </div>

                    {/* Related Articles */}
                    <div className="mt-12">
                        <h3 className="font-heading text-xl text-neon-purple mb-6">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/blog/jupiter-great-red-spot" className="planet-card hover:border-neon-cyan/60 transition-colors">
                                <span className="text-2xl mr-3">🌪️</span>
                                <span className="text-text-secondary hover:text-white transition-colors">
                                    Jupiter&apos;s Great Red Spot: A Storm Bigger Than Earth
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
