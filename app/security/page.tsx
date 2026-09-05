import type { Metadata } from 'next';
import { ContentShell } from '../content-shell';

export const metadata: Metadata = {
  title: 'MergeGrounds security',
  description:
    'Threat model, responsible disclosure path, supported release policy, and the explicit limits of MergeGrounds.',
  alternates: { canonical: '/security' },
};

export default function Security() {
  return (
    <ContentShell
      eyebrow="SECURITY / DISCLOSURE"
      title="Trust starts with limits."
      description="MergeGrounds controls admission. It cannot prove arbitrary software safe, replace expert review, or verify external settings from files alone."
    >
      <h2>Report a vulnerability</h2>
      <p>
        Use GitHub’s private vulnerability reporting on the MergeGrounds
        repository. Do not open a public issue for an unpatched vulnerability, a
        bypass, exposed credential, or exploit detail.
      </p>
      <p>
        <a
          href="https://github.com/ExCoder/mergegrounds/security/advisories/new"
          rel="noreferrer"
        >
          Open a private security advisory
        </a>
      </p>

      <h2>What is in scope</h2>
      <ul>
        <li>fail-open behavior in a required gate;</li>
        <li>evidence replay, subject mismatch, or scope-confusion bypass;</li>
        <li>control-plane lock or CODEOWNERS bypass;</li>
        <li>
          unsafe handling of candidate-controlled paths, files, or environment;
        </li>
        <li>
          workflow permission, action-pinning, and release-integrity failures.
        </li>
      </ul>

      <h2>Supported versions</h2>
      <p>
        Security fixes target the newest published release. Maintainers may ask
        reporters to confirm a finding against the current main branch when the
        fix does not expose additional risk.
      </p>

      <h2>Security posture</h2>
      <p>
        The portable runner is dependency-free Python and intentionally rejects
        missing, stale, malformed, timed-out, skipped, or ambiguous evidence.
        The maximum-assurance architecture additionally requires a protected
        verifier, isolated execution, authenticated identities, and rulesets
        outside the candidate’s control.
      </p>
    </ContentShell>
  );
}
