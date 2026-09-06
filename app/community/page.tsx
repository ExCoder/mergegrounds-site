import Link from 'next/link';
import { ContentShell } from '../content-shell';
import { createPageMetadata } from '../page-metadata';

export const metadata = createPageMetadata({
  path: '/community',
  title: 'MergeGrounds community',
  description:
    'Contribute adapters, failure fixtures, documentation, and evidence-led improvements to MergeGrounds.',
});

export default function Community() {
  return (
    <ContentShell
      eyebrow="COMMUNITY / CONTRIBUTE"
      title="Make the standard harder to fool."
      description="The most useful contribution is a reproducible case where a weak change could pass—or a legitimate change is blocked for the wrong reason."
    >
      <h2>Ways to contribute</h2>
      <div className="prose-grid">
        <section>
          <h3>Bring a stack</h3>
          <p>
            Add a real adapter fixture with pinned tools, machine-readable
            reports, positive controls, and at least one expected failure.
          </p>
        </section>
        <section>
          <h3>Break a gate</h3>
          <p>
            Report evidence replay, import shadowing, stale scope, workflow
            drift, or another bypass through private security reporting.
          </p>
        </section>
        <section>
          <h3>Improve the path</h3>
          <p>
            Reduce time to first demo and preview, clarify an error, or document
            a recovery without weakening the underlying policy.
          </p>
        </section>
        <section>
          <h3>Share evidence</h3>
          <p>
            Publish a sanitized case study: what failed, which control stopped
            it, what changed, and what remained uncertain.
          </p>
        </section>
      </div>

      <h2>Start here</h2>
      <ul>
        <li>
          <a
            href="https://github.com/ExCoder/mergegrounds/issues"
            rel="noreferrer"
          >
            Browse issues
          </a>
        </li>
        <li>
          <a
            href="https://github.com/ExCoder/mergegrounds/discussions"
            rel="noreferrer"
          >
            Join GitHub Discussions
          </a>
        </li>
        <li>
          <a
            href="https://github.com/ExCoder/mergegrounds/blob/main/CONTRIBUTING.md"
            rel="noreferrer"
          >
            Read the contribution guide
          </a>
        </li>
        <li>
          <Link href="/docs/getting-started">Run the demo and preview</Link>
        </li>
      </ul>

      <aside className="prose-callout">
        <strong>No star begging, no vanity numbers.</strong>
        <p>
          We ask for sharp feedback and useful reproductions. Stars should be
          the consequence of earned trust, not the price of participation.
        </p>
      </aside>
    </ContentShell>
  );
}
