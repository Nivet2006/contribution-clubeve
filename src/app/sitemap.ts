import { MetadataRoute } from 'next';
import { fetchPublicRounds } from '@/lib/firestore-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contribute-theonepercentclub.web.app';

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/polls`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  try {
    // Dynamic active evaluation rounds
    const rounds = await fetchPublicRounds();
    const roundRoutes: MetadataRoute.Sitemap = rounds.map((r) => ({
      url: `${baseUrl}/round/${r.id}`,
      lastModified: new Date(r.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...roundRoutes];
  } catch {
    return staticRoutes;
  }
}
