import type { Metadata } from 'next'
import { Inter, Orbitron, Rajdhani } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
    title: 'OrbitQuest - Solar System Arcade',
    description: 'Explore the solar system through 8 planet-themed mini-games. Learn about space while having fun! Unlock new worlds with Stardust.',
    keywords: ['space games', 'solar system', 'arcade', 'educational games', 'planet games', 'astronomy'],
    authors: [{ name: 'CoredrivN' }],
    openGraph: {
        title: 'OrbitQuest - Solar System Arcade',
        description: 'Explore the solar system through 8 planet-themed mini-games.',
        type: 'website',
        locale: 'en_US',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable}`}>
            <head>
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
            </body>
        </html>
    )
}
