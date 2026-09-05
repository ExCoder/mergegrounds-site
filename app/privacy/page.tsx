import type { Metadata } from 'next';
import { ContentShell } from '../content-shell';

export const metadata: Metadata = {
  title: 'MergeGrounds privacy',
  description:
    'What the MergeGrounds documentation website collects, what GitHub receives when you follow a link, and how future changes will be disclosed.',
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return (
    <ContentShell
      eyebrow="PRIVACY / TRANSPARENCY"
      title="A small site with a small data surface."
      description="The MergeGrounds website has no accounts, forms, advertising pixels, or first-party analytics. The repository and community live on GitHub under GitHub’s own terms."
    >
      <h2>What this site collects</h2>
      <p>
        MergeGrounds does not set application cookies, create user profiles,
        accept form submissions, or run first-party analytics on this website.
        The hosting infrastructure may process ordinary request metadata needed
        to deliver and protect the site, such as IP address, user agent, URL,
        timestamp, and security signals.
      </p>

      <h2>Links to GitHub</h2>
      <p>
        Source code, releases, issues, discussions, stars, and private security
        reports are hosted by GitHub. When you follow one of those links, GitHub
        processes the interaction under its own privacy statement and terms.
        MergeGrounds does not receive your GitHub credentials.
      </p>

      <h2>No telemetry in the portable runner</h2>
      <p>
        The open-source MergeGrounds runner does not send project source,
        evidence, or usage telemetry to a MergeGrounds service. Tools that you
        configure as adapters may have their own network and data-handling
        behavior; review those tools before enabling them.
      </p>

      <h2>Changes</h2>
      <p>
        If accounts, analytics, hosted verification, or other data-collecting
        features are introduced, this page and the relevant repository
        documentation will be updated before that feature is presented as
        available. Last updated: September 5, 2026.
      </p>
    </ContentShell>
  );
}
