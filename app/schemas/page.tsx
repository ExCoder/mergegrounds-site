import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentShell } from '../content-shell';

export const metadata: Metadata = {
  title: 'MergeGrounds JSON Schemas',
  description:
    'Canonical Draft 2020-12 schemas for MergeGrounds subjects, policies, evidence, waivers, and admission decisions.',
  alternates: { canonical: '/schemas' },
};

const schemas = [
  [
    'Subject',
    '/schemas/subject-v1.schema.json',
    'Exact repository and revision identity.',
  ],
  [
    'Policy',
    '/schemas/policy-v1.schema.json',
    'Trusted keys, producers, controls, and freshness rules.',
  ],
  [
    'Evidence',
    '/schemas/evidence-v1.schema.json',
    'Signed, scope-complete control evidence.',
  ],
  [
    'Waiver',
    '/schemas/waiver-v1.schema.json',
    'Time-bounded, subject-bound exception authorization.',
  ],
  [
    'Decision',
    '/schemas/decision-v1.schema.json',
    'Deterministic fail-closed admission output.',
  ],
] as const;

export default function SchemasPage() {
  return (
    <ContentShell
      eyebrow="REFERENCE / JSON SCHEMAS"
      title="Canonical evidence contracts."
      description="Browser-resolvable Draft 2020-12 schemas shipped byte-for-byte with MergeGrounds Verifier 0.1.0."
    >
      <p>
        These v1 URLs are normative identifiers for the reference verifier. Pin
        the verifier release and validate the schema bytes you consume; a URL
        alone is not a supply-chain trust decision.
      </p>

      <h2>Schema set</h2>
      <ul>
        {schemas.map(([name, href, description]) => (
          <li key={href}>
            <a href={href}>{name} v1</a> — {description}
          </li>
        ))}
      </ul>

      <h2>Reference implementation</h2>
      <p>
        The{' '}
        <a href="https://github.com/ExCoder/mergegrounds-verifier">
          MergeGrounds Verifier
        </a>{' '}
        package embeds the same five files and rejects unknown fields at every
        security-sensitive object boundary. Read the{' '}
        <Link href="/docs/trust-boundary">trust-boundary guide</Link> before
        treating a valid document as trusted evidence.
      </p>

      <aside className="prose-callout">
        <strong>Schema-valid is not trusted.</strong>
        <p>
          Admission also requires exact subject and policy binding, an
          authorized producer, a valid signature, complete scope, and fresh
          evidence. The verifier applies those semantic checks fail-closed.
        </p>
      </aside>
    </ContentShell>
  );
}
