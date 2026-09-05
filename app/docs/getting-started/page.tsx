import Link from 'next/link';
import { ContentShell } from '../../content-shell';
import { createPageMetadata } from '../../page-metadata';

export const metadata = createPageMetadata({
  path: '/docs/getting-started',
  title: '90-second demo and safe bootstrap | MergeGrounds',
  description:
    'Run the immutable v1.0.1 educational demo, preview bootstrap without changes, then review, apply, and verify MergeGrounds controls.',
});

export default function GettingStarted() {
  return (
    <ContentShell
      eyebrow="DOCS / GETTING STARTED"
      title="Run the demo. Preview before apply."
      description="Begin with the deterministic educational model. Then preview every bootstrap change; freshly copied controls are never an active security boundary."
    >
      <section data-step="demo">
        <h2>1. Run the immutable 90-second demo</h2>
        <p>
          Start with the{' '}
          <a
            href="https://github.com/ExCoder/mergegrounds-demo/releases/tag/v1.0.1"
            rel="noreferrer"
          >
            immutable demo release v1.0.1
          </a>
          . It needs Python 3.9 or newer and no third-party packages.
        </p>
        <pre>
          <code>{`git clone --branch v1.0.1 --depth 1 \\
  https://github.com/ExCoder/mergegrounds-demo.git
cd mergegrounds-demo
python3 demo.py`}</code>
        </pre>
        <p>The deterministic run prints:</p>
        <pre>
          <code>{`ADMITTED admitted             complete exact evidence
DENIED   stale-evidence       stale:evidence
DENIED   wrong-commit         revision_mismatch:unit-tests
DENIED   incomplete-scope     scope_mismatch:static-analysis
DENIED   survived-mutant      survived_mutant
DENIED   missing-producer     missing_producer:static-analysis
DEMO PASSED: 1 admitted control; 5 negative controls denied`}</code>
        </pre>
        <p>
          This is an educational model, not a production verifier or assurance
          claim. It demonstrates one admitted control and five negative controls
          without grading a real repository.
        </p>
      </section>

      <section data-step="core">
        <h2>2. Clone the reviewed core release</h2>
        <pre>
          <code>{`git clone --branch v1.0.0 --depth 1 \\
  https://github.com/ExCoder/mergegrounds.git`}</code>
        </pre>
        <p>
          Core bootstrap needs Python 3.11 or newer. For an existing Git
          repository, follow steps 3–4 without <code>--allow-non-git</code>. For
          a new non-Git project, use only the separate empty-directory path in
          step 5. Compare the release archive against its published checksums
          before use. Keep the clone intact: the skill, runner, policy schemas,
          workflows, and reference material form one versioned control plane.
        </p>
      </section>

      <section data-step="preview" data-target-kind="existing-git">
        <h2>3. Preview an existing Git repository; change nothing</h2>
        <pre>
          <code>{`python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py \\
  --target /absolute/path/to/your-repository`}</code>
        </pre>
        <p>
          Preview reports only CREATE and CONFLICT planning results. It changes
          no files, prints <code>Dry run only</code>, and exits 0 on a
          successful preview. The reviewed reference run reported{' '}
          <code>Plan: conflict=5, create=43</code>; counts depend on the target.
          This is a file plan, not a security verdict.
        </p>
      </section>

      <section data-step="apply" data-target-kind="existing-git">
        <h2>4. Review, then apply to the existing Git repository</h2>
        <pre>
          <code>{`python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py \\
  --target /absolute/path/to/your-repository \\
  --apply`}</code>
        </pre>
        <p>
          Apply only after a real owner has reviewed every CREATE and CONFLICT
          entry. Replace deliberate ownership placeholders, inspect adapter
          commands, pin toolchains, and connect machine-readable coverage and
          mutation reports. Do not weaken a failed control merely to get green.
        </p>
      </section>

      <section
        data-step="empty-directory"
        data-target-kind="new-empty-directory"
      >
        <h2>5. Alternative: start a new empty directory</h2>
        <p>Create the directory first and leave it completely empty:</p>
        <pre>
          <code>mkdir /absolute/path/to/new-empty-project</code>
        </pre>
        <p>
          <strong>Preview without writing:</strong>
        </p>
        <pre>
          <code>{`python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py \\
  --target /absolute/path/to/new-empty-project \\
  --allow-non-git`}</code>
        </pre>
        <p>
          Review every CREATE and CONFLICT entry, then apply with the same
          explicit permission:
        </p>
        <pre>
          <code>{`python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py \\
  --target /absolute/path/to/new-empty-project \\
  --allow-non-git \\
  --apply`}</code>
        </pre>
        <p>
          <code>--allow-non-git</code> is restricted to an existing, completely
          empty directory. Never use it for an existing Git repository or a
          non-empty directory; bootstrap rejects both cases. Initialize Git in
          that exact directory only after applying and reviewing the starter.
        </p>
      </section>

      <section data-step="verify">
        <h2>6. Seal, verify, and expect red</h2>
        <pre>
          <code>{`python3 -I scripts/mergegrounds.py seal --write
python3 -I scripts/mergegrounds.py doctor
python3 -I scripts/mergegrounds.py verify-repo --strict`}</code>
        </pre>
        <p>
          Commit the reviewed controls and their seal separately. The full
          profile remains red until the project-specific fuzz harness and
          authoritative evidence producers are connected.{' '}
          <Link href="/docs/expected-red">
            Understand the expected-red result
          </Link>{' '}
          before changing any policy.
        </p>
      </section>

      <section data-step="enforcement">
        <h2>7. Configure external enforcement</h2>
        <p>
          Repository files alone are not an active security boundary. Maximum
          assurance requires a separately administered verifier, required checks
          bound to its identity, protected owners, and a ruleset with no
          alternate write path.
        </p>
        <p>
          Start from the separately versioned{' '}
          <a href="https://github.com/ExCoder/mergegrounds-verifier">
            reference verifier
          </a>{' '}
          and its <Link href="/schemas">canonical schemas</Link>. It is a
          decision core, not a hosted trust boundary; operators must supply
          independent administration, identities, isolation, and protected
          GitHub settings.
        </p>
      </section>

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
