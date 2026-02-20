import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use - OrbitQuest',
    description: 'Terms of Use for OrbitQuest Solar System Arcade.',
};

export default function TermsPage() {
    return (
        <>
            <Header />

            <main className="flex-1 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-3xl text-neon-cyan mb-8">Terms of Use</h1>

                    <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
                        <p className="text-text-dim text-sm">
                            Last Updated: February 2026
                        </p>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using OrbitQuest (&quot;the Website&quot;), you accept and agree to be bound
                                by these Terms of Use. If you do not agree to these terms, please do not use this website.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">2. Use of Content</h2>
                            <p>
                                All content on this website, including games, graphics, text, and educational materials,
                                is provided for personal, non-commercial use only. You may not:
                            </p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>Reproduce, distribute, or modify any content without our written permission</li>
                                <li>Use any automated systems to access the website</li>
                                <li>Attempt to reverse engineer or decompile any games or software</li>
                                <li>Use the website for any illegal or unauthorized purpose</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">3. Game Data and Progress</h2>
                            <p>
                                Your game progress, including Stardust balance and unlocked planets, is stored locally
                                on your device using browser localStorage. We are not responsible for:
                            </p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>Loss of game data due to clearing browser data</li>
                                <li>Data loss when switching devices or browsers</li>
                                <li>Corrupted save data</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">4. Disclaimer of Warranties</h2>
                            <p>
                                This website and all games are provided &quot;as is&quot; and &quot;as available&quot; without any
                                warranties of any kind, either express or implied. We do not warrant that:
                            </p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>The website will be uninterrupted or error-free</li>
                                <li>Defects will be corrected</li>
                                <li>The website is free of viruses or other harmful components</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">5. Third-Party Content and Advertisements</h2>
                            <p>
                                OrbitQuest displays advertisements from Google AdSense and may contain links to
                                third-party websites. We are not responsible for:
                            </p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>The content of any advertisements displayed</li>
                                <li>The content, privacy policies, or practices of third-party websites</li>
                                <li>Any products or services offered by third parties</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">6. Educational Content</h2>
                            <p>
                                The educational content provided about planets and space is sourced from publicly
                                available information from organizations such as NASA and ESA. While we strive
                                for accuracy, this content is provided for entertainment and general educational
                                purposes only and should not be relied upon for academic or professional purposes
                                without independent verification from authoritative sources.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">7. Limitation of Liability</h2>
                            <p>
                                To the fullest extent permitted by applicable law, OrbitQuest and its operators shall not be
                                liable for any indirect, incidental, special, consequential, or punitive damages
                                arising from your use of the website or games.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">8. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms of Use at any time. Changes will be
                                effective immediately upon posting to this page. Your continued use of the website
                                after any changes constitutes your acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">9. Contact Us</h2>
                            <p>
                                If you have any questions about these Terms of Use, please contact us at:{' '}
                                <a href="mailto:solutions@coredrivn.com" className="text-neon-cyan hover:underline">
                                    solutions@coredrivn.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
