import { ContentShell } from '../content-shell';
import { createPageMetadata } from '../page-metadata';

export const metadata = createPageMetadata({
  path: '/privacy',
  title: 'MergeGrounds privacy',
  description:
    'What the MergeGrounds documentation website collects, what GitHub receives when you follow a link, and how future changes will be disclosed.',
});

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

      <h2>Cloudflare infrastructure and security cookies</h2>
      <p>
        The site is delivered through Cloudflare infrastructure. Depending on
        the request and the security controls Cloudflare applies, Cloudflare may
        set strictly necessary bot-management or challenge cookies such as{' '}
        <code>__cf_bm</code> or <code>cf_clearance</code>. They support traffic
        integrity and abuse prevention; MergeGrounds does not use them for
        advertising or first-party analytics. Cloudflare documents that{' '}
        <code>__cf_bm</code> expires after 30 minutes of continuous inactivity.
        The <code>cf_clearance</code> duration follows the configured Cloudflare
        Challenge Passage. Cloudflare creates and manages these cookies;
        MergeGrounds does not control their creation, operation, or retention.
      </p>
      <p>
        <a
          href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/"
          rel="noreferrer"
        >
          Cloudflare cookie documentation
        </a>
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
        available. Last updated: September 6, 2026.
      </p>
    </ContentShell>
  );
}
