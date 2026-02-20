import type { Metadata } from 'next'
import { Inter, Orbitron, Rajdhani } from 'next/font/google'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics';

// Font configurations
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const orbitron = Orbitron({
    subsets: ['latin'],
    variable: '--font-orbitron',
    display: 'swap',
})

const rajdhani = Rajdhani({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-rajdhani',
    display: 'swap',
})

const siteUrl = 'https://orbitquest.games';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover' as const,
};

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'OrbitQuest - Free Solar System Arcade Games | Learn Space Science',
        template: '%s | OrbitQuest',
    },
    description: 'Explore our solar system through 10 unique planet-themed arcade games! Free educational space games featuring Neptune, Jupiter, Saturn, Mars & more. Learn astronomy while having fun!',
    keywords: ['space games', 'solar system', 'arcade games', 'educational games', 'planet games', 'astronomy', 'free games', 'browser games', 'science games', 'NASA', 'learn space', 'Neptune game', 'Jupiter game', 'Mars game'],
    authors: [{ name: 'CoredrivN', url: 'https://coredrivn.com' }],
    creator: 'CoredrivN',
    publisher: 'CoredrivN',
    openGraph: {
        title: 'OrbitQuest - Free Solar System Arcade Games',
        description: 'Explore our solar system through 10 unique planet-themed arcade games! Free educational space games for all ages.',
        url: siteUrl,
        siteName: 'OrbitQuest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'OrbitQuest - Solar System Arcade',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'OrbitQuest - Free Solar System Arcade Games',
        description: 'Explore our solar system through 10 unique planet-themed arcade games!',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    category: 'games',
}

// Organization Schema for SEO
const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OrbitQuest',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Free educational space arcade games exploring our solar system.',
    sameAs: [],
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'solutions@coredrivn.com',
        contactType: 'customer service',
    },
};

// WebSite Schema for SEO
const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OrbitQuest',
    url: siteUrl,
    description: 'Free educational space arcade games exploring our solar system through planet-themed mini-games.',
    publisher: {
        '@type': 'Organization',
        name: 'CoredrivN',
    },
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/games/{planet}`,
        },
        'query-input': 'required name=planet',
    },
};

// VideoGame Schema for SEO
const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'OrbitQuest',
    description: 'A collection of 10 free arcade games exploring our solar system. Each planet features a unique game mechanic inspired by real science.',
    url: siteUrl,
    genre: ['Educational Game', 'Arcade Game', 'Space Game'],
    playMode: 'SinglePlayer',
    applicationCategory: 'Game',
    operatingSystem: 'Any (Web Browser)',
    gamePlatform: 'Web Browser',
    numberOfPlayers: {
        '@type': 'QuantitativeValue',
        value: 1,
    },
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
    },
    author: {
        '@type': 'Organization',
        name: 'CoredrivN',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable}`}>
            <head>
                {/* PWA Meta Tags */}
                <meta name="application-name" content="OrbitQuest" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="OrbitQuest" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-TileColor" content="#00f0ff" />
                <meta name="format-detection" content="telephone=no" />
                <GoogleAnalytics gaId="G-2LS6MLDXLV" />
                <meta name="theme-color" content="#0a0a1a" media="(prefers-color-scheme: dark)" />
                <meta name="theme-color" content="#0a0a1a" media="(prefers-color-scheme: light)" />

                {/* PWA Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/* Organization Schema */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                {/* WebSite Schema */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                {/* VideoGame Schema */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
                />
                {/* AdSense Script - Add your publisher ID after approval */}
                {/* 
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" 
          crossOrigin="anonymous"
        />
        */}
            </head>
            <body className="font-body antialiased">
                {/* Starfield Background */}
                <div className="starfield" aria-hidden="true" />

                {/* Main Content */}
                <div className="relative z-10 min-h-screen flex flex-col">
                    {children}
                </div>

                {/* Service Worker Registration */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    )
}
