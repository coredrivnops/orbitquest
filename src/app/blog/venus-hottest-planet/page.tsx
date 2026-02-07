import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Why Is Venus Hotter Than Mercury? The Runaway Greenhouse Effect - OrbitQuest',
    description: 'Despite being further from the Sun, Venus is the hottest planet in our solar system. Learn about the runaway greenhouse effect and what it means for Earth.',
    keywords: ['Venus temperature', 'hottest planet', 'greenhouse effect Venus', 'Venus atmosphere', 'Venus facts', 'climate change'],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Why is Venus hotter than Mercury?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Venus is hotter than Mercury because of its thick carbon dioxide atmosphere that traps heat through an extreme greenhouse effect. While Mercury is closer to the Sun, it has no atmosphere to retain heat. Venus's atmosphere traps solar energy so effectively that surface temperatures reach 465°C (869°F) - hot enough to melt lead."
            }
        },
        {
            "@type": "Question",
            "name": "How hot is Venus?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Venus has an average surface temperature of approximately 465°C (869°F). This makes it the hottest planet in our solar system, hotter than Mercury despite being nearly twice as far from the Sun. The temperature is remarkably uniform across the entire planet, day and night."
            }
        },
        {
            "@type": "Question",
            "name": "What caused Venus's runaway greenhouse effect?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Scientists believe Venus may have once had oceans, but as the young Sun grew brighter, water evaporated. Water vapor is a greenhouse gas that trapped more heat, causing more evaporation in a feedback loop. Eventually, all water was lost to space, and volcanic carbon dioxide accumulated in the atmosphere with nothing to absorb it."
            }
        }
    ]
};

export default function VenusHottestPlanet() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Header />

            <main className="flex-1 py-16">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="mb-8 text-sm">
                        <Link href="/" className="text-text-dim hover:text-neon-cyan">Home</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <Link href="/blog" className="text-text-dim hover:text-neon-cyan">Blog</Link>
                        <span className="text-text-dim mx-2">/</span>
                        <span className="text-neon-cyan">Why Venus Is Hottest</span>
                    </nav>

                    <header className="mb-12 text-center">
                        <span className="text-7xl mb-4 block">🔥</span>
                        <h1 className="font-heading text-3xl md:text-4xl text-neon-cyan mb-4">
                            Why Is Venus Hotter Than Mercury? The Runaway Greenhouse Effect
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-text-dim text-sm">
                            <span>January 2026</span>
                            <span>•</span>
                            <span>6 min read</span>
                        </div>
                    </header>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg text-text-secondary leading-relaxed mb-8">
                            Here&apos;s a planetary puzzle: Mercury is the closest planet to the Sun,
                            orbiting at just 58 million kilometers. Venus is nearly twice as far,
                            at 108 million kilometers. Yet Venus is dramatically hotter than Mercury.
                            This counterintuitive fact reveals one of the most important concepts
                            in planetary science - and carries profound implications for our own planet.
                        </p>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Temperature Paradox
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Let&apos;s compare the numbers:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="planet-card bg-gray-800/30 p-6 text-center">
                                    <p className="text-4xl mb-2">☿️</p>
                                    <h3 className="text-white font-bold mb-2">Mercury</h3>
                                    <p className="text-text-dim text-sm mb-2">Closest to the Sun</p>
                                    <p className="text-text-secondary">Day: <span className="text-orange-400 font-bold">430°C</span></p>
                                    <p className="text-text-secondary">Night: <span className="text-blue-400 font-bold">-180°C</span></p>
                                </div>
                                <div className="planet-card bg-orange-900/30 p-6 text-center border-orange-500/30">
                                    <p className="text-4xl mb-2">♀️</p>
                                    <h3 className="text-white font-bold mb-2">Venus</h3>
                                    <p className="text-text-dim text-sm mb-2">Second from the Sun</p>
                                    <p className="text-text-secondary">Day: <span className="text-red-400 font-bold">465°C</span></p>
                                    <p className="text-text-secondary">Night: <span className="text-red-400 font-bold">465°C</span></p>
                                </div>
                            </div>
                            <p className="text-text-secondary leading-relaxed">
                                Notice something remarkable: Venus maintains the same extreme temperature
                                day and night, while Mercury swings wildly between scorching heat and
                                frigid cold. This difference holds the key to our mystery.
                            </p>
                        </section>

                        <div className="planet-card bg-gradient-to-r from-orange-900/30 to-red-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-orange-400 mb-2">🌡️ Just How Hot Is 465°C?</h3>
                            <p className="text-text-secondary">
                                Venus&apos;s surface temperature of 465°C (869°F) is hot enough to melt lead,
                                zinc, and tin. No spacecraft has survived more than about 2 hours on the
                                surface. The Soviet Venera probes that landed in the 1970s and 80s were
                                crushed and cooked in minutes.
                            </p>
                        </div>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                The Answer: Venus&apos;s Atmosphere
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The difference comes down to <strong className="text-white">atmosphere</strong>.
                                Mercury has virtually no atmosphere - its weak gravity and proximity to the
                                Sun&apos;s solar wind stripped away any gases long ago. Without an atmosphere,
                                Mercury can&apos;t trap heat; it escapes immediately into space when the Sun
                                sets.
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Venus, by contrast, has an incredibly thick atmosphere. The atmospheric
                                pressure at Venus&apos;s surface is <strong className="text-white">92 times
                                    greater than Earth&apos;s</strong> - equivalent to being 900 meters underwater
                                in Earth&apos;s oceans.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                This atmosphere is composed of approximately:
                            </p>
                            <ul className="space-y-2 text-text-secondary mt-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400">•</span>
                                    <span><strong className="text-white">96.5% carbon dioxide (CO₂)</strong> - a powerful greenhouse gas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-400">•</span>
                                    <span><strong className="text-white">3.5% nitrogen</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    <span>Trace amounts of sulfur dioxide, creating sulfuric acid clouds</span>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Understanding the Greenhouse Effect
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The greenhouse effect is a natural process where certain atmospheric
                                gases trap heat. Here&apos;s how it works on Venus:
                            </p>
                            <ol className="list-decimal list-inside space-y-3 text-text-secondary mb-4">
                                <li>Sunlight passes through the atmosphere and warms the surface</li>
                                <li>The warm surface emits infrared (heat) radiation back toward space</li>
                                <li>Carbon dioxide molecules absorb this infrared radiation</li>
                                <li>The absorbed energy re-radiates in all directions, including back down</li>
                                <li>The surface receives heat from both the Sun AND the atmosphere</li>
                                <li>Temperature continues rising until equilibrium is reached</li>
                            </ol>
                            <p className="text-text-secondary leading-relaxed">
                                On Venus, this effect is so extreme that the planet is a
                                <strong className="text-white"> textbook example of a runaway greenhouse
                                    effect</strong> - a feedback loop where warming causes more warming.
                            </p>
                        </section>

                        <div className="planet-card bg-gradient-to-r from-blue-900/30 to-green-900/20 p-6 mb-12">
                            <h3 className="font-heading text-lg text-neon-cyan mb-2">🌍 Earth&apos;s Greenhouse Effect</h3>
                            <p className="text-text-secondary">
                                Earth also has a greenhouse effect - and it&apos;s essential for life!
                                Without it, our planet would average -18°C instead of +15°C. The concern
                                about climate change is not the greenhouse effect itself, but
                                <em> increasing</em> its intensity by adding more greenhouse gases to the
                                atmosphere. Venus shows what can happen when this effect goes to extremes.
                            </p>
                        </div>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                How Did Venus Become This Way?
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Scientists believe Venus may have once been much more Earth-like.
                                Computer models suggest it could have had liquid water oceans for
                                billions of years. So what went wrong?
                            </p>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The current theory involves a catastrophic feedback loop:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-text-secondary mb-4">
                                <li>The young Sun gradually grew brighter over time</li>
                                <li>Increased solar radiation warmed Venus&apos;s oceans</li>
                                <li>Water evaporated into the atmosphere (water vapor is a greenhouse gas)</li>
                                <li>More water vapor trapped more heat, causing more evaporation</li>
                                <li>Eventually, all water evaporated</li>
                                <li>Solar radiation split water molecules; hydrogen escaped to space</li>
                                <li>Volcanic CO₂ accumulated with no oceans to absorb it</li>
                            </ol>
                            <p className="text-text-secondary leading-relaxed">
                                The result is the hellish world we see today - and a cautionary tale
                                about the power of atmospheric composition.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Venus: Earth&apos;s &quot;Evil Twin&quot;
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Venus is sometimes called Earth&apos;s twin because of their similar size
                                and composition. But the comparison also serves as a warning:
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse mb-4">
                                    <thead>
                                        <tr className="border-b border-neon-cyan/30">
                                            <th className="text-left py-3 px-4 text-neon-cyan font-heading">Property</th>
                                            <th className="text-left py-3 px-4 text-blue-400 font-heading">Earth</th>
                                            <th className="text-left py-3 px-4 text-orange-400 font-heading">Venus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-text-secondary">
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Diameter</td>
                                            <td className="py-3 px-4">12,742 km</td>
                                            <td className="py-3 px-4">12,104 km (95%)</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Surface Temperature</td>
                                            <td className="py-3 px-4">15°C avg</td>
                                            <td className="py-3 px-4">465°C</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-3 px-4">Atmospheric CO₂</td>
                                            <td className="py-3 px-4">0.04%</td>
                                            <td className="py-3 px-4">96.5%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4">Surface Pressure</td>
                                            <td className="py-3 px-4">1 bar</td>
                                            <td className="py-3 px-4">92 bar</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="font-heading text-2xl text-neon-purple mb-4">
                                Conclusion: A Lesson Written in Clouds
                            </h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Venus stands as a stark reminder that a planet&apos;s distance from the
                                Sun isn&apos;t the only factor determining its temperature. Atmospheric
                                composition matters enormously - perhaps even more so.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                By studying Venus, we gain insights into how planets evolve over
                                time and the delicate balance that makes Earth habitable. Our
                                &quot;evil twin&quot; in the inner solar system serves as both a scientific
                                laboratory and a warning about the power of greenhouse gases.
                            </p>
                        </section>

                        <section className="border-t border-white/10 pt-8 mb-12">
                            <h3 className="font-heading text-lg text-text-dim mb-4">Sources</h3>
                            <ul className="text-text-dim text-sm space-y-1">
                                <li>• NASA Solar System Exploration - Venus</li>
                                <li>• ESA Venus Express - Atmospheric Studies</li>
                                <li>• Nature Geoscience - Venus Climate Modeling</li>
                            </ul>
                        </section>
                    </div>

                    <div className="planet-card bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-8 text-center">
                        <h3 className="font-heading text-xl text-neon-cyan mb-3">Survive Venus&apos;s Atmosphere!</h3>
                        <p className="text-text-secondary mb-6">
                            Navigate through Venus&apos;s crushing atmosphere in our &quot;Cloud Surfer&quot;
                            game and experience the extreme conditions firsthand.
                        </p>
                        <Link href="/games/venus" className="btn-neon inline-block">
                            ☁️ Play Venus: Cloud Surfer
                        </Link>
                    </div>

                    <div className="mt-12">
                        <h3 className="font-heading text-xl text-neon-purple mb-6">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/blog/why-is-neptune-blue" className="planet-card hover:border-neon-cyan/60">
                                <span className="text-2xl mr-3">🔵</span>
                                <span className="text-text-secondary">Why Is Neptune Blue?</span>
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
