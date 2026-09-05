import type { Metadata } from 'next';
import { ContentShell } from '../../content-shell';

export const metadata: Metadata = {
  title: 'Why MergeGrounds starts red',
  description:
    'Understand the deliberate activation failures that prevent an unconfigured security skeleton from being mistaken for enforcement.',
  alternates: { canonical: '/docs/expected-red' },
};

export default function ExpectedRed() {
  return (
    <ContentShell
      eyebrow="DOCS / EXPECTED RED"
      title="Red is a safety feature."
      description="An untouched skeleton cannot know your owners, stack, threat model, or trusted verifier. Calling that state green would be dishonest."
    >
      <h2>Expected activation failures</h2>
      <div className="prose-grid">
        <section>
          <h3>No real owner</h3>
          <p>
            Example CODEOWNERS entries must be replaced with valid people or
            teams who are accountable for control-plane changes.
          </p>
        </section>
        <section>
          <h3>No detected stack</h3>
          <p>
            A generic starter cannot infer build, coverage, mutation, or release
            behavior until it is applied to an actual project.
          </p>
        </section>
        <section>
          <h3>No project fuzz harness</h3>
          <p>
            The full profile requires a real target and useful assertions—not a
            placeholder command that exits successfully.
          </p>
        </section>
        <section>
          <h3>No independent verifier</h3>
          <p>
            Candidate-produced evidence is diagnostic until a separately
            administered producer verifies the exact subject and scope.
          </p>
        </section>
      </div>

      <h2>The rule</h2>
      <pre>
        <code>
          missing | stale | malformed | skipped | inconclusive =&gt;
          not_evaluated not_evaluated + required_control =&gt; deny
        </code>
      </pre>

      <h2>How green is earned</h2>
      <ol>
        <li>
          Bind every adapter to real project commands and machine-readable
          reports.
        </li>
        <li>
          Prove negative controls: a survivor, missing tool, stale report, and
          policy drift must fail.
        </li>
        <li>
          Move the authoritative judge outside the candidate’s write boundary.
        </li>
        <li>
          Require the resulting check identities in a protected GitHub ruleset.
        </li>
        <li>
          Re-run against the final revision and promote the same artifact by
          digest.
        </li>
      </ol>

      <aside className="prose-callout warning">
        <strong>Do not “fix” expected red by lowering a threshold.</strong>
        <p>
          Supply the missing evidence or explicitly document why the control is
          not applicable through trusted policy. Silence is never evidence.
        </p>
      </aside>
    </ContentShell>
  );
}
