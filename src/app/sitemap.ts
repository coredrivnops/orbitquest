import { MetadataRoute } from 'next';
import { PLANETS } from '@/lib/gameTypes';

// Blog post slugs
const BLOG_POSTS = [
    'why-is-neptune-blue',
    'jupiter-great-red-spot',
    'saturn-rings-composition',
    'mars-olympus-mons',
    'venus-hottest-planet',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://orbitquest.games';
    const currentDate = new Date().toISOString();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    // Game pages
    const gamePages: MetadataRoute.Sitemap = PLANETS.map((planet) => ({
        url: `${baseUrl}/games/${planet.id}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.9,
    }));

    // Blog pages
    const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [...staticPages, ...gamePages, ...blogPages];
}
