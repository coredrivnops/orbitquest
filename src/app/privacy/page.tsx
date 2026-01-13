import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - OrbitQuest',
    description: 'Privacy Policy for OrbitQuest Solar System Arcade. Learn how we collect and use your data.',
};

export default function PrivacyPage() {
    return (
        <>
            <Header />

            <main className="flex-1 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-3xl text-neon-cyan mb-8">Privacy Policy</h1>

                    <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
                        <p className="text-text-dim text-sm">
                            Last Updated: January 2026
                        </p>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">1. Introduction</h2>
                            <p>
                                Welcome to OrbitQuest (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy
                                and being transparent about how we collect and use information. This Privacy Policy explains
                                our practices regarding data collection when you use our website and games.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">2. Advertising and Cookies (Google AdSense)</h2>
                            <p>
                                OrbitQuest uses Google AdSense to display advertisements. Google AdSense and other
                                third-party vendors use cookies to serve ads based on your prior visits to this website
                                or other websites.
                            </p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>
                                    Google&apos;s use of advertising cookies enables it and its partners to serve ads based on
                                    your visit to OrbitQuest and/or other sites on the Internet.
                                </li>
                                <li>
                                    You may opt out of personalized advertising by visiting{' '}
                                    <a
                                        href="https://www.google.com/settings/ads"
                                        className="text-neon-cyan hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Google Ads Settings
                                    </a>.
                                </li>
                                <li>
                                    Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s
                                    prior visits to this website or other websites.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">3. Data Collection</h2>
                            <p>We may collect the following non-personally identifiable information:</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Referring website</li>
                                <li>Pages visited and time spent on pages</li>
                                <li>Anonymous usage statistics</li>
                            </ul>
                            <p className="mt-4">
                                <strong>We do NOT collect:</strong> Names, email addresses, physical addresses,
                                phone numbers, or any other personally identifiable information unless you voluntarily
                                provide it through our contact form.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">4. Local Storage</h2>
                            <p>
                                OrbitQuest uses browser localStorage to save your game progress, including:
                            </p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>Stardust balance</li>
                                <li>Unlocked planets</li>
                                <li>High scores</li>
                            </ul>
                            <p className="mt-4">
                                This data is stored only on your device and is never transmitted to our servers.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">5. GDPR Compliance (European Visitors)</h2>
                            <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong>Right to Access:</strong> Request copies of your personal data.</li>
                                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data.</li>
                                <li><strong>Right to Erasure:</strong> Request deletion of your personal data.</li>
                                <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing.</li>
                                <li><strong>Right to Object:</strong> Object to our processing of your personal data.</li>
                            </ul>
                            <p className="mt-4">
                                To exercise any of these rights, please contact us at solutions@coredrivn.com.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">6. Children&apos;s Privacy</h2>
                            <p>
                                OrbitQuest is designed to be family-friendly. We do not knowingly collect personal
                                information from children under 13. If you believe we have collected such information,
                                please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">7. Jurisdiction</h2>
                            <p>
                                This website is operated from India. By using this site, you consent to the
                                processing of your information as described in this policy under the applicable
                                laws of India.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">8. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any
                                changes by posting the new Privacy Policy on this page and updating the
                                &quot;Last Updated&quot; date.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl text-neon-purple mb-4">9. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:{' '}
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
