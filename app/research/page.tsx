import type { Metadata } from 'next';
import { ContentShell } from '../content-shell';

export const metadata: Metadata = {
  title: 'Research behind MergeGrounds',
  description:
    'Primary sources and explicit reasoning behind fail-closed admission control for AI-assisted software.',
  alternates: { canonical: '/research' },
};

export default function Research() {
  return (
    <ContentShell
      eyebrow="RESEARCH / EVIDENCE BASE"
      title="Why this control plane exists."
      description="The practices in MergeGrounds are grounded in software assurance, supply-chain security, and the measured trust gap around AI-generated code."
    >
      <h2>The adoption–trust gap</h2>
      <p>
        In Stack Overflow’s 2025 developer survey, 84% of respondents used or
        planned to use AI tools, while 46% distrusted their accuracy. The common
        complaint was output that is almost right but still expensive to debug.
        That tension—not a claim that all generated code is bad—is the product
        premise.
      </p>
      <p>
        <a href="https://survey.stackoverflow.co/2025/ai" rel="noreferrer">
          Source: Stack Overflow Developer Survey 2025
        </a>
      </p>

      <h2>Supply-chain foundations</h2>
      <ul>
        <li>
          <a href="https://slsa.dev/spec/v1.2/" rel="noreferrer">
            SLSA v1.2
          </a>{' '}
          defines provenance and build integrity concepts used by the
          build-once, promote-by-digest model.
        </li>
        <li>
          <a href="https://scorecard.dev/" rel="noreferrer">
            OpenSSF Scorecard
          </a>{' '}
          provides measurable signals for risky open-source repository
          practices.
        </li>
        <li>
          <a
            href="https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions"
            rel="noreferrer"
          >
            GitHub Actions security hardening
          </a>{' '}
          documents permission, pinning, and untrusted-input boundaries.
        </li>
      </ul>

      <h2>Testing as evidence</h2>
      <p>
        Coverage answers what executed; mutation testing asks whether tests
        discriminate between correct and deliberately damaged behavior.
        MergeGrounds requires both where policy materializes them and treats
        incomplete reports as not evaluated.
      </p>
      <p>
        <a href="https://mutationtesting.org/" rel="noreferrer">
          Source: Mutation Testing Elements
        </a>
      </p>

      <h2>Research policy</h2>
      <p>
        We separate verified facts, local observations, and product hypotheses.
        Pages that compare tools include a checked date and link to primary
        documentation. Benchmarks must publish fixtures, versions, raw results,
        and limitations before they become marketing claims.
      </p>
    </ContentShell>
  );
}
