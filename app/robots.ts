import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://mergegrounds.flowy-bass-8622.chatgpt.site/sitemap.xml',
  };
}
