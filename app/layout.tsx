import type { Metadata } from 'next';
import './globals.css';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://mergegrounds.chawax.chatgpt.site/#organization',
      name: 'MergeGrounds',
      url: 'https://mergegrounds.chawax.chatgpt.site/',
      sameAs: ['https://github.com/ExCoder/mergegrounds'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://mergegrounds.chawax.chatgpt.site/#website',
      name: 'MergeGrounds',
      url: 'https://mergegrounds.chawax.chatgpt.site/',
      publisher: {
        '@id': 'https://mergegrounds.chawax.chatgpt.site/#organization',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MergeGrounds',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Cross-platform',
      description:
        'Open-source, multi-stack, fail-closed admission control for AI-assisted code.',
      url: 'https://mergegrounds.chawax.chatgpt.site/',
      downloadUrl: 'https://github.com/ExCoder/mergegrounds',
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@id': 'https://mergegrounds.chawax.chatgpt.site/#organization',
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://mergegrounds.chawax.chatgpt.site'),
  title: 'MergeGrounds — Every merge needs evidence',
  description:
    'Open-source, fail-closed admission control for AI-assisted code. Design contracts, mutation testing, security gates, and exact-revision evidence.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'MergeGrounds — Every merge needs evidence',
    description:
      'Open-source, fail-closed admission control for AI-assisted code.',
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
    title: 'MergeGrounds — Every merge needs evidence',
    description:
      'Open-source, fail-closed admission control for AI-assisted code.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
