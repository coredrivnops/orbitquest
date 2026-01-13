import { MetadataRoute } from 'next';
import { PLANETS } from '@/lib/gameTypes';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://orbitquest.coredrivn.com';
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

    return [...staticPages, ...gamePages];
}
