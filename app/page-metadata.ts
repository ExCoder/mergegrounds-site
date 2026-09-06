import type { Metadata } from 'next';

type PageMetadata = Readonly<{
  path: `/${string}`;
  title: string;
  description: string;
}>;

export function createPageMetadata({
  path,
  title,
  description,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      title,
      description,
      siteName: 'MergeGrounds',
      images: [
        {
          url: '/og.png',
          width: 1280,
          height: 640,
          alt: 'MergeGrounds — Every merge needs evidence',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.png'],
    },
  };
}
