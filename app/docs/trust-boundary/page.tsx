import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentShell } from '../../content-shell';

export const metadata: Metadata = {
  title: 'The MergeGrounds trust boundary',
  description:
    'Why a pull request must not control the policy, evidence producer, or identity used to decide its own admission.',
  alternates: { canonical: '/docs/trust-boundary' },
};

export default function TrustBoundary() {
  return (
    <ContentShell
      eyebrow="DOCS / TRUST BOUNDARY"
      title="A change cannot judge itself."
      description="The strongest assurance claim requires separating proposal, evidence production, admission, human approval, and release promotion."
    >
      <h2>The five identities</h2>
      <ol>
        <li>
          <strong>Proposer:</strong> the human or agent that authors the change.
        </li>
        <li>
          <strong>Untrusted runner:</strong> produces fast diagnostic output
          with no write credentials.
        </li>
        <li>
          <strong>Evidence producer:</strong> independently evaluates a
          read-only, exact source snapshot.
        </li>
        <li>
          <strong>Admission identity:</strong> reconciles signed evidence under
          protected policy.
        </li>
        <li>
          <strong>Release identity:</strong> promotes the already attested
          artifact by digest.
        </li>
      </ol>

      <h2>Why repository CI is not enough</h2>
      <p>
        A pull request can modify workflows stored on its branch. Even when
        GitHub executes a base-owned definition, candidate code still runs in an
        adversarial workspace. Logs and report files are claims until a trusted
        producer checks their scope, subject, and completeness.
      </p>

      <h2>Evidence must bind</h2>
      <ul>
        <li>
          repository identity, candidate commit, tree digest, and base commit;
        </li>
        <li>canonical diff and applicable policy digest;</li>
        <li>
          tool, version, runner image, workflow definition, and isolation class;
        </li>
        <li>
          expected and observed files, cases, mutants, findings, and exclusions;
        </li>
        <li>
          artifact digest, signer identity, freshness, and invalidation
          conditions.
        </li>
      </ul>

      <h2>Portable versus maximum assurance</h2>
      <p>
        The open repository supplies policy, adapters, schemas, local gates, and
        hardened workflow templates. Maximum assurance exists only after the
        external verifier, identities, rulesets, isolation, and release path are
        deployed and independently verified in your environment.
      </p>
      <p>
        Inspect the separately versioned{' '}
        <a href="https://github.com/ExCoder/mergegrounds-verifier">
          reference verifier
        </a>{' '}
        and the five <Link href="/schemas">canonical JSON Schemas</Link>. The
        reference implementation validates the decision contract; it does not
        create the independent operational boundary on your behalf.
      </p>

      <aside className="prose-callout">
        <strong>Narrow claim, stronger trust</strong>
        <p>
          MergeGrounds does not certify arbitrary code as safe. It records which
          exact revision satisfied which explicit policy with which authentic,
          complete evidence.
        </p>
      </aside>
    </ContentShell>
  );
}
