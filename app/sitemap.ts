import type { MetadataRoute } from 'next';

const origin = 'https://mergegrounds.chawax.chatgpt.site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/docs/getting-started',
    '/docs/expected-red',
    '/docs/trust-boundary',
    '/docs/ai-system-assurance',
    '/research',
    '/security',
    '/privacy',
    '/community',
  ];

  return pages.map((path, index) => ({
    url: `${origin}${path || '/'}`,
    lastModified: new Date('2026-09-05T00:00:00Z'),
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : 0.7,
  }));
}
