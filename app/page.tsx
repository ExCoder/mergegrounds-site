import {
  ArrowRight,
  Bot,
  Braces,
  Fingerprint,
  GitFork,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  TestTubeDiagonal,
  UsersRound,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';

const checks = [
  { label: 'Exact revision bound', state: 'PASS', tone: 'pass' },
  { label: 'Tests + mutation', state: 'PASS', tone: 'pass' },
  { label: 'Security evidence', state: 'MISSING', tone: 'fail' },
  { label: 'Independent verifier', state: 'NOT EVALUATED', tone: 'fail' },
];

const controlCards = [
  {
    icon: Workflow,
    title: 'Design before code',
    body: 'Risk-ranked changes must carry reviewed acceptance oracles and failure behavior before implementation starts.',
  },
  {
    icon: Braces,
    title: 'Strict quality gates',
    body: 'Formatting, lint, types, unit tests, coverage, and build are required signals—not optional suggestions.',
  },
  {
    icon: TestTubeDiagonal,
    title: 'Mutation that discriminates',
    body: 'Tests must kill meaningful mutants. Survived, uncovered, timed-out, or invalid mutants fail the gate.',
  },
  {
    icon: LockKeyhole,
    title: 'Security by default',
    body: 'Secret, SAST, dependency, workflow, and supply-chain controls reject missing or inconclusive output.',
  },
  {
    icon: Fingerprint,
    title: 'Exact subject binding',
    body: 'Evidence is bound to the candidate commit, base, policy, tree, and artifact digest—never only a branch name.',
  },
  {
    icon: PackageCheck,
    title: 'Build once, promote',
    body: 'Release controls promote the reviewed artifact by digest instead of rebuilding something merely similar.',
  },
  {
    icon: Bot,
    title: 'AI-product assurance',
    body: 'When AI ships in the product, evaluation extends to retrieval, context, tools, providers, drift, and rollback.',
  },
  {
    icon: UsersRound,
    title: 'Humans stay accountable',
    body: 'Independent review and explain-back remain explicit. A second model is defense in depth, not approval.',
  },
];

const stacks = [
  'Node / TypeScript',
  'Python',
  'Go',
  'Rust',
  'Maven',
  'Gradle',
  '.NET',
  'PHP',
  'Strict custom adapter',
];

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <nav className="nav-wrap" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="MergeGrounds home">
            <span className="brand-mark" aria-hidden="true">
              MG//
            </span>
            <span>MergeGrounds</span>
          </a>
          <div className="nav-links">
            <a href="#controls">Controls</a>
            <a href="#trust">Trust model</a>
            <a href="#quickstart">Quickstart</a>
          </div>
          <a
            className="nav-github"
            href="https://github.com/ExCoder/mergegrounds"
            rel="noreferrer"
          >
            <GitFork aria-hidden="true" size={17} />
            GitHub
          </a>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">
              <span>Open source</span>
              <span>Fail closed</span>
              <span>GitHub ready</span>
            </p>
            <h1>
              Every merge
              <br />
              needs <em>evidence.</em>
            </h1>
            <p className="hero-lede">
              AI proposes changes. MergeGrounds decides what has earned the
              right to merge—with design contracts, mutation testing, security
              gates, and exact-revision evidence.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#quickstart">
                Run a read-only audit
                <ArrowRight aria-hidden="true" size={18} />
              </a>
              <a
                className="button button-secondary"
                href="https://github.com/ExCoder/mergegrounds"
                rel="noreferrer"
              >
                <GitFork aria-hidden="true" size={18} />
                View source
              </a>
            </div>
            <p className="truth-line">
              <ShieldCheck aria-hidden="true" size={18} />
              No “100% safe” claims. Missing, stale, malformed, or self-graded
              evidence is denied by the documented controls instead of silently
              passing.
            </p>
          </div>

          <aside
            className="verdict-card"
            aria-label="Example admission verdict"
          >
            <div className="verdict-topline">
              <span>REVISION / 8F179AB</span>
              <span className="live-dot">POLICY R3</span>
            </div>
            <div className="verdict-heading">
              <span className="verdict-icon" aria-hidden="true">
                ×
              </span>
              <div>
                <p>ADMISSION VERDICT</p>
                <h2>DENIED</h2>
              </div>
            </div>
            <div className="check-list">
              {checks.map((check, index) => (
                <div className="check-row" key={check.label}>
                  <span className="check-index">0{index + 1}</span>
                  <span>{check.label}</span>
                  <strong className={check.tone}>{check.state}</strong>
                </div>
              ))}
            </div>
            <div className="verdict-rule">
              <span>DECISION RULE</span>
              <code>missing_evidence == deny</code>
            </div>
            <p className="verdict-note">
              Green CI is a signal. Admission requires complete evidence for the
              exact revision.
            </p>
          </aside>
        </div>

        <div className="principle-strip" aria-label="Core principles">
          <span>MISSING ≠ PASS</span>
          <span>THE PR MUST NOT EDIT ITS OWN JUDGE</span>
          <span>BUILD ONCE · PROMOTE BY DIGEST</span>
        </div>
      </section>

      <section className="problem-section" id="trust">
        <p className="section-number">01 / THE TRUST GAP</p>
        <h2>The problem isn’t AI. It’s unearned trust.</h2>
        <p>
          Linters, scanners, and tests produce signals. MergeGrounds turns those
          signals into one fail-closed admission decision—bound to the source,
          policy, reviewer, and artifact that actually ran.
        </p>
      </section>

      <section className="proof-section" id="proof">
        <div className="proof-intro">
          <p className="section-number inverse">02 / PROOF, NOT PROMISES</p>
          <h2>Watch a weak change stop.</h2>
          <p>
            A passing tool exit code is not enough. The collector validates
            structured output, expected scope, completeness, freshness, and the
            exact revision before it can emit a pass.
          </p>
          <Link className="text-link" href="/docs/expected-red">
            Why the starter begins red{' '}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div
          className="terminal-window"
          aria-label="Example MergeGrounds audit"
        >
          <div className="terminal-chrome">
            <span>mergegrounds / audit</span>
            <span>READ ONLY</span>
          </div>
          <pre>
            <code>
              <span className="terminal-muted">$</span> python3 -I
              scripts/bootstrap.py --target .{String.raw`\n`}
              {String.raw`\n`}
              <span className="terminal-muted">[01]</span> detect
              stack............{' '}
              <span className="terminal-pass">node-typescript</span>
              {String.raw`\n`}
              <span className="terminal-muted">[02]</span> inspect
              controls......... <span className="terminal-pass">18 found</span>
              {String.raw`\n`}
              <span className="terminal-muted">[03]</span> verify
              ownership......... <span className="terminal-fail">missing</span>
              {String.raw`\n`}
              <span className="terminal-muted">[04]</span> verify mutation
              report... <span className="terminal-fail">not evaluated</span>
              {String.raw`\n`}
              {String.raw`\n`}
              <span className="terminal-fail">DENY</span> 2 activation
              requirements remain{String.raw`\n`}
              <span className="terminal-muted">No files changed. Exit 2.</span>
            </code>
          </pre>
        </div>
      </section>

      <section className="architecture-section">
        <div className="section-heading-row">
          <p className="section-number">03 / THE DECISION LAYER</p>
          <div>
            <h2>Not another scanner.</h2>
            <p>
              Keep the tools you trust. MergeGrounds reconciles their evidence
              under one deterministic policy and refuses ambiguous results.
            </p>
          </div>
        </div>
        <div className="decision-flow" aria-label="Admission decision flow">
          <div className="flow-node">
            <span>INPUTS</span>
            <strong>Tests · scanners · build · reviewers</strong>
          </div>
          <ArrowRight aria-hidden="true" />
          <div className="flow-node highlighted">
            <span>MERGEGROUNDS</span>
            <strong>Policy + evidence reconciliation</strong>
          </div>
          <ArrowRight aria-hidden="true" />
          <div className="flow-node">
            <span>OUTPUT</span>
            <strong>Admit · deny · explicitly waive</strong>
          </div>
        </div>
      </section>

      <section className="controls-section" id="controls">
        <div className="section-heading-row">
          <p className="section-number">04 / CONTROL SURFACE</p>
          <div>
            <h2>Hard gates across the lifecycle.</h2>
            <p>
              Stack-aware where tools differ. Stack-independent where trust
              cannot.
            </p>
          </div>
        </div>
        <div className="controls-grid">
          {controlCards.map((control, index) => {
            const Icon = control.icon;
            return (
              <article className="control-card" key={control.title}>
                <div className="control-meta">
                  <Icon aria-hidden="true" size={22} strokeWidth={1.6} />
                  <span>0{index + 1}</span>
                </div>
                <h3>{control.title}</h3>
                <p>{control.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="assurance-section">
        <div className="section-heading-row">
          <p className="section-number inverse">05 / HONEST ASSURANCE</p>
          <div>
            <h2>Two levels. One clear boundary.</h2>
            <p>
              The repository delivers strong portable controls. Maximum
              assurance additionally needs a separately administered verifier
              and protected GitHub settings.
            </p>
          </div>
        </div>
        <div className="assurance-grid">
          <article>
            <p className="tier-label">AVAILABLE IN THE REPOSITORY</p>
            <h3>Portable controls</h3>
            <ul>
              <li>Strict policy runner and evidence schemas</li>
              <li>Quality, mutation, security, and supply-chain gates</li>
              <li>Risk-ranked design and change contracts</li>
              <li>Read-only audit and dry-run bootstrap</li>
            </ul>
            <Link className="text-link light" href="/docs/getting-started">
              Start here <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </article>
          <article className="maximum-card">
            <p className="tier-label">REQUIRES EXTERNAL TRUST</p>
            <h3>Maximum assurance</h3>
            <ul>
              <li>Independent GitHub App or protected verifier</li>
              <li>Isolated execution against read-only source</li>
              <li>Authenticated reviewers and signed attestations</li>
              <li>Rulesets with no administrator bypass</li>
            </ul>
            <Link className="text-link light" href="/docs/trust-boundary">
              Read the trust model <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </article>
        </div>
      </section>

      <section className="stacks-section">
        <p className="section-number">06 / STACK COVERAGE</p>
        <div>
          <h2>Bring your stack. Keep your tools.</h2>
          <div className="stack-list">
            {stacks.map((stack) => (
              <span key={stack}>{stack}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="quickstart-section" id="quickstart">
        <div className="quickstart-copy">
          <p className="section-number">07 / FIRST VALUE</p>
          <h2>Audit first. Change nothing.</h2>
          <p>
            Preview the controls against an existing repository. Bootstrap only
            after you have reviewed every create and conflict entry.
          </p>
          <div className="quick-links">
            <Link
              className="button button-primary"
              href="/docs/getting-started"
            >
              Full quickstart <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="button button-secondary" href="/security">
              Security model
            </Link>
          </div>
        </div>
        <div className="code-card">
          <div className="code-step">
            <span>01</span>
            <div>
              <strong>Clone</strong>
              <code>git clone https://github.com/ExCoder/mergegrounds.git</code>
            </div>
          </div>
          <div className="code-step">
            <span>02</span>
            <div>
              <strong>Preview</strong>
              <code>
                python3 -I mergegrounds/scripts/bootstrap.py --target .
              </code>
            </div>
          </div>
          <div className="code-step">
            <span>03</span>
            <div>
              <strong>Review, then apply</strong>
              <code>
                python3 -I mergegrounds/scripts/bootstrap.py --target . --apply
              </code>
            </div>
          </div>
        </div>
      </section>

      <section className="community-section" id="community">
        <div>
          <p>OPEN SOURCE · APACHE-2.0</p>
          <h2>No grounds. No merge.</h2>
        </div>
        <div>
          <p>
            Try the audit on a real repository. Bring back the false positives,
            awkward stacks, and failure modes. That is how the standard gets
            stronger.
          </p>
          <div className="hero-actions">
            <a
              className="button button-signal"
              href="https://github.com/ExCoder/mergegrounds"
              rel="noreferrer"
            >
              <GitFork aria-hidden="true" size={18} />
              Star on GitHub
            </a>
            <Link className="button button-dark-outline" href="/community">
              Join the community
            </Link>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">MG//</span>
          <span>MergeGrounds</span>
        </a>
        <p>Every merge needs evidence.</p>
        <div>
          <Link href="/docs/getting-started">Docs</Link>
          <Link href="/research">Research</Link>
          <Link href="/security">Security</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="https://github.com/ExCoder/mergegrounds">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
