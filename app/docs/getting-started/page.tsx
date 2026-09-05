import type { Metadata } from 'next';
import { ContentShell } from '../../content-shell';

export const metadata: Metadata = {
  title: 'Getting started with MergeGrounds',
  description:
    'Run a read-only repository audit, review the activation plan, and bootstrap fail-closed admission controls safely.',
  alternates: { canonical: '/docs/getting-started' },
};

export default function GettingStarted() {
  return (
    <ContentShell
      eyebrow="DOCS / GETTING STARTED"
      title="Audit first. Earn green."
      description="Start with a read-only preview. MergeGrounds never treats a freshly copied policy as an active security boundary."
    >
      <h2>What you need</h2>
      <ul>
        <li>Python 3.11 or newer.</li>
        <li>
          An existing Git repository, or a completely empty directory for a new
          project.
        </li>
        <li>
          A real owner who can configure GitHub rulesets and review
          security-sensitive changes.
        </li>
      </ul>

      <h2>1. Clone the control plane</h2>
      <pre>
        <code>git clone https://github.com/ExCoder/mergegrounds.git</code>
      </pre>
      <p>
        Keep the clone intact: the skill, runner, policy schemas, workflows, and
        reference material form one versioned control plane.
      </p>

      <h2>2. Preview against your repository</h2>
      <pre>
        <code>
          python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py \
          --target /absolute/path/to/your-repository
        </code>
      </pre>
      <p>
        Preview reports files it would create and conflicts it would refuse to
        overwrite. It does not modify the target.
      </p>

      <h2>3. Review, then apply</h2>
      <pre>
        <code>
          python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py \
          --target /absolute/path/to/your-repository \ --apply
        </code>
      </pre>
      <p>
        Replace the deliberate ownership placeholders, inspect detected
        commands, pin toolchains, and connect machine-readable coverage and
        mutation reports. Do not weaken a failed control merely to get green.
      </p>

      <h2>4. Seal and verify</h2>
      <pre>
        <code>
          python3 -I scripts/guardian.py seal --write python3 -I
          scripts/guardian.py doctor python3 -I scripts/guardian.py verify-repo
          --strict
        </code>
      </pre>
      <p>
        Commit the reviewed controls and their seal separately. The full profile
        remains red until the project-specific fuzz harness and authoritative
        evidence producers are connected.
      </p>

      <h2>5. Configure external enforcement</h2>
      <p>
        Maximum assurance requires a verifier outside the candidate repository,
        required checks bound to that verifier identity, protected owners, and a
        ruleset with no alternate write path. Repository files alone cannot
        prove those settings exist.
      </p>

      <aside className="prose-callout">
        <strong>Safe removal</strong>
        <p>
          Remove required GitHub checks through an authorized base-controlled
          change before deleting local control files. Never let a candidate pull
          request remove the judge used to evaluate itself.
        </p>
      </aside>
    </ContentShell>
  );
}
