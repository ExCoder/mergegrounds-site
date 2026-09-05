import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';

const projectFile = (path) => new URL(`../${path}`, import.meta.url);
const readSource = (path) => readFile(projectFile(path), 'utf8');

const routeFiles = new Map([
  ['app/docs/ai-system-assurance/page.tsx', '/docs/ai-system-assurance'],
  ['app/docs/expected-red/page.tsx', '/docs/expected-red'],
  ['app/docs/getting-started/page.tsx', '/docs/getting-started'],
  ['app/docs/trust-boundary/page.tsx', '/docs/trust-boundary'],
  ['app/community/page.tsx', '/community'],
  ['app/privacy/page.tsx', '/privacy'],
  ['app/research/page.tsx', '/research'],
  ['app/schemas/page.tsx', '/schemas'],
  ['app/security/page.tsx', '/security'],
]);

const checks = [];
const check = (name, verify) => checks.push({ name, verify });

const SYSTEM_GIT = '/usr/bin/git';
const FAKE_COMMIT = '1111111111111111111111111111111111111111';

const fixtureGitEnvironment = {
  PATH: '/usr/bin:/bin',
  LANG: 'C',
  LC_ALL: 'C',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_PAGER: 'cat',
};

function runFixtureGit(repositoryDirectory, arguments_) {
  return execFileSync(
    SYSTEM_GIT,
    ['--no-pager', '-C', repositoryDirectory, ...arguments_],
    {
      cwd: repositoryDirectory,
      encoding: 'utf8',
      env: fixtureGitEnvironment,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10_000,
    },
  ).trim();
}

async function withCleanGitFixture(verify) {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'mergegrounds-launch-'));
  const repositoryDirectory = join(fixtureRoot, 'repository');

  try {
    await mkdir(repositoryDirectory);
    execFileSync(
      SYSTEM_GIT,
      ['init', '--quiet', '--initial-branch=main', repositoryDirectory],
      {
        cwd: fixtureRoot,
        env: fixtureGitEnvironment,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 10_000,
      },
    );
    await writeFile(join(repositoryDirectory, 'tracked.txt'), 'reviewed\n');
    runFixtureGit(repositoryDirectory, ['add', 'tracked.txt']);
    runFixtureGit(repositoryDirectory, [
      '-c',
      'user.name=MergeGrounds Test',
      '-c',
      'user.email=mergegrounds-test@invalid.example',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    ]);
    const head = runFixtureGit(repositoryDirectory, [
      'rev-parse',
      '--verify',
      'HEAD',
    ]);

    await verify({ fixtureRoot, head, repositoryDirectory });
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
}

async function loadSourceIdentity() {
  const identity = await import('./source-identity.mjs?adversarial-contract');
  assert.equal(
    typeof identity.resolveSourceIdentity,
    'function',
    'source identity module must export resolveSourceIdentity',
  );
  return identity;
}

async function loadRuntimeContract() {
  const runtime = await import('./runtime-contract.mjs?adversarial-contract');
  for (const exportName of [
    'assertCommunityRuntimeContract',
    'assertHomepageRuntimeContract',
    'assertGettingStartedRuntimeContract',
    'assertRouteMetadataContract',
    'assertPrivacyRetentionContract',
    'assertNavigationContrastContract',
    'assertNotFoundRuntimeContract',
    'assertTruthfulFunnelAcrossRoutes',
  ]) {
    assert.equal(
      typeof runtime[exportName],
      'function',
      `runtime contract must export ${exportName}`,
    );
  }
  return runtime;
}

function homepageFixture({
  cloneRef = 'v1.0.0',
  coreVersion = '1.0.0',
  demoCommand = 'python3 demo.py',
  demoRef = 'v1.0.1',
  demoSummary = 'DEMO PASSED: 1 admitted control; 5 negative controls denied',
  downloadRef = 'v1.0.0',
  githubLabel = 'View GitHub source',
  communityCopy = 'If the demo or bootstrap preview delivered value, starring is optional. An issue or reproducible feedback is equally useful.',
  primaryHref = '/docs/getting-started',
  siteVersion = '1.2.2',
  stackLimitation = 'Included adapter definitions, not blanket support. End-to-end validation and public green fixtures are pending for each ecosystem.',
} = {}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: 'MergeGrounds', version: siteVersion },
      {
        '@type': 'SoftwareApplication',
        name: 'Merge Fur Grounds',
        softwareVersion: coreVersion,
        downloadUrl: `https://github.com/ExCoder/mergegrounds/releases/tag/${downloadRef}`,
      },
    ],
  };
  return [
    '<!doctype html><html><head></head><body>',
    '<a class="skip-link" href="#main-content">Skip to main content</a>',
    `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
    '<header><nav aria-label="Primary navigation">',
    '<a class="brand" href="#top"><span class="brand-mark" aria-hidden="true">MG//</span>MergeGrounds</a>',
    '</nav></header>',
    '<main id="main-content">',
    `<div class="hero-actions"><a class="button button-primary" href="${primaryHref}">Read the quickstart<svg></svg></a></div>`,
    `<a class="button button-secondary" href="https://github.com/ExCoder/mergegrounds-demo/releases/tag/${demoRef}">Immutable demo ${demoRef}</a>`,
    '<section class="proof-section"><p>Educational model, not a repository audit or a production assurance claim.</p>',
    '<figure class="terminal-window"><figcaption>Deterministic educational demo output</figcaption><pre><code>',
    `$ ${demoCommand}\n`,
    'ADMITTED admitted complete exact evidence\n',
    'DENIED stale-evidence stale:evidence\n',
    'DENIED wrong-commit revision_mismatch:unit-tests\n',
    'DENIED incomplete-scope scope_mismatch:static-analysis\n',
    'DENIED survived-mutant survived_mutant\n',
    'DENIED missing-producer missing_producer:static-analysis\n',
    `${demoSummary}\n`,
    'Educational demo only — this is not a production assurance claim.',
    '</code></pre></figure></section>',
    `<section class="stacks-section"><h2>Included adapter definitions</h2><p>${stackLimitation}</p></section>`,
    '<section class="quickstart-section"><h2>Preview first. Change nothing.</h2><p>After the demo, bootstrap preview reports only CREATE and CONFLICT planning results, prints Dry run only, and exits 0 on success.</p>',
    `<code>git clone --branch ${cloneRef} --depth 1 https://github.com/ExCoder/mergegrounds.git</code>`,
    '<code>python3 -I mergegrounds/scripts/bootstrap.py --target .</code>',
    '<code>python3 -I mergegrounds/scripts/bootstrap.py --target . --apply</code>',
    '<code>python3 -I scripts/mergegrounds.py verify-repo --strict</code>',
    '<a href="/docs/expected-red">Understand the expected-red result</a></section>',
    `<section class="community-section"><p>${communityCopy}</p><a class="button button-signal" href="https://github.com/ExCoder/mergegrounds">${githubLabel}</a></section>`,
    '</main>',
    '<footer><span class="brand-mark" aria-hidden="true">MG//</span></footer>',
    '</body></html>',
  ].join('');
}

function gettingStartedFixture({
  demoCommand = 'python3 demo.py',
  demoRef = 'v1.0.1',
  demoSummary = 'DEMO PASSED: 1 admitted control; 5 negative controls denied',
  emptyContinuation = '\\',
  emptyApplyFlag = '--allow-non-git',
  emptyPreviewFlag = '--allow-non-git',
  existingApplyFlag = '',
  existingPreviewFlag = '',
  firstStep = 'demo',
} = {}) {
  const demoStep = [
    '<section data-step="demo"><h2>1. Run the immutable 90-second demo</h2>',
    `<a href="https://github.com/ExCoder/mergegrounds-demo/releases/tag/${demoRef}">Immutable demo release ${demoRef}</a>`,
    `<code>git clone --branch ${demoRef} --depth 1 https://github.com/ExCoder/mergegrounds-demo.git cd mergegrounds-demo ${demoCommand}</code>`,
    '<pre>ADMITTED admitted complete exact evidence\nDENIED stale-evidence stale:evidence\nDENIED wrong-commit revision_mismatch:unit-tests\nDENIED incomplete-scope scope_mismatch:static-analysis\nDENIED survived-mutant survived_mutant\nDENIED missing-producer missing_producer:static-analysis\n',
    `${demoSummary}</pre></section>`,
  ].join('');
  const bootstrapStep = [
    '<section data-step="preview" data-target-kind="existing-git"><h2>3. Preview an existing Git repository; change nothing</h2>',
    `<code>python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py --target /absolute/path/to/your-repository ${existingPreviewFlag}</code>`,
    '<p>The preview reports only CREATE and CONFLICT planning results, prints Dry run only, and exits 0 on success.</p></section>',
  ].join('');
  const orderedSteps =
    firstStep === 'demo'
      ? `${demoStep}${bootstrapStep}`
      : `${bootstrapStep}${demoStep}`;

  return [
    '<!doctype html><html><head>',
    '<title>90-second demo and safe bootstrap | MergeGrounds</title>',
    '<meta name="description" content="Run the immutable v1.0.1 educational demo, preview bootstrap without changes, then review, apply, and verify MergeGrounds controls.">',
    '</head><body><header><h1>Run the demo. Preview before apply.</h1></header>',
    '<main id="main-content"><article class="prose-shell">',
    orderedSteps,
    `<section data-step="apply" data-target-kind="existing-git"><h2>4. Review, then apply to the existing Git repository</h2><code>python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py --target /absolute/path/to/your-repository ${existingApplyFlag} --apply</code></section>`,
    '<section data-step="empty-directory" data-target-kind="new-empty-directory"><h2>5. Alternative: start a new empty directory</h2>',
    `<code>python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py ${emptyContinuation}\n  --target /absolute/path/to/new-empty-project ${emptyContinuation}\n  ${emptyPreviewFlag}</code>`,
    `<code>python3 -I /absolute/path/to/mergegrounds/scripts/bootstrap.py ${emptyContinuation}\n  --target /absolute/path/to/new-empty-project ${emptyContinuation}\n  ${emptyApplyFlag} ${emptyContinuation}\n  --apply</code>`,
    '<p>--allow-non-git is restricted to an existing, completely empty directory. Never use it for an existing Git repository or a non-empty directory.</p>',
    '<script>python3 -I scripts/bootstrap.py --target /decoy --allow-non-git --apply</script></section>',
    '<section data-step="verify"><h2>6. Seal, verify, and expect red</h2><code>python3 -I scripts/mergegrounds.py verify-repo --strict</code><a href="/docs/expected-red">Understand the expected-red result</a></section>',
    '<p>Repository files alone are not an active security boundary. Maximum assurance requires a separately administered verifier.</p>',
    '</article></main><footer></footer></body></html>',
  ].join('');
}

function communityFixture({
  improvementCopy = 'Reduce time to first demo and preview without weakening the underlying policy.',
  startLabel = 'Run the demo and preview',
} = {}) {
  return [
    '<!doctype html><html><body>',
    '<header><h1>Make the standard harder to fool.</h1></header>',
    '<main id="main-content"><article class="prose-shell">',
    '<div class="prose-grid"><section><h3>Improve the path</h3>',
    `<p>${improvementCopy}</p></section></div>`,
    '<h2>Start here</h2><ul><li>',
    `<a href="/docs/getting-started">${startLabel}</a>`,
    '</li></ul>',
    '<script>Run the demo and preview; reduce time to first demo and preview.</script>',
    '</article></main><footer></footer></body></html>',
  ].join('');
}

function truthfulRouteFixtures(overrides = new Map()) {
  return new Map(
    ['/', ...routeFiles.values()].map((path) => [
      path,
      overrides.get(path) ??
        '<main><p>Use the educational demo, then inspect the bootstrap preview.</p><script>Run the read-only audit; time to first audit.</script></main>',
    ]),
  );
}

function metadataFixture(path, index, urlPath = path) {
  const origin = 'https://mergegrounds.chawax.chatgpt.site';
  const title = `Route title ${index}`;
  const description = `Distinct rendered route description number ${index} for contract validation.`;
  return [
    '<!doctype html><html><head>',
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${origin}${urlPath}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${origin}${urlPath}">`,
    `<meta property="og:image" content="${origin}/og.png">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${origin}/og.png">`,
    '</head><body>',
    '<header><nav></nav><span class="brand-mark" aria-hidden="true">MG//</span></header>',
    '<main id="main-content"></main>',
    '<footer><span class="brand-mark" aria-hidden="true">MG//</span></footer>',
    '</body></html>',
  ].join('');
}

function assertInOrder(source, tokens, context) {
  let cursor = -1;
  for (const token of tokens) {
    const next = source.indexOf(token, cursor + 1);
    assert.notEqual(next, -1, `${context}: missing ${JSON.stringify(token)}`);
    assert.ok(
      next > cursor,
      `${context}: ${JSON.stringify(token)} is out of order`,
    );
    cursor = next;
  }
}

function assertMatches(source, pattern, context) {
  assert.ok(pattern.test(source), `${context}: expected ${pattern}`);
}

check('homepage pins the reviewed core v1.0.0 clone', async () => {
  const source = await readSource('app/page.tsx');
  assertMatches(
    source,
    /git clone --branch v1\.0\.0 --depth 1\s+https:\/\/github\.com\/ExCoder\/mergegrounds\.git/,
    'homepage clone command',
  );
});

check('homepage primary CTA truthfully opens the quickstart', async () => {
  const source = await readSource('app/page.tsx');
  assertMatches(
    source,
    /className="button button-primary"[\s\S]{0,120}href="\/docs\/getting-started"[\s\S]{0,120}Read the quickstart/,
    'homepage primary CTA',
  );
});

check('homepage exposes the immutable demo v1.0.1 CTA', async () => {
  const source = await readSource('app/page.tsx');
  assertMatches(
    source,
    /href="https:\/\/github\.com\/ExCoder\/mergegrounds-demo\/releases\/tag\/v1\.0\.1"[\s\S]{0,160}Immutable demo v1\.0\.1/,
    'homepage immutable demo CTA',
  );
});

check('homepage presents the truthful demo-first funnel', async () => {
  const source = await readSource('app/page.tsx');
  for (const token of [
    'python3 demo.py',
    'DEMO PASSED: 1 admitted control; 5 negative controls denied',
    'Educational model',
    'not a repository audit',
    'Preview first. Change nothing.',
    'Included adapter definitions',
    'View GitHub source',
  ]) {
    assert.ok(source.includes(token), `truthful homepage: missing ${token}`);
  }
  assertMatches(
    source,
    /End-to-end\s+validation and public green fixtures are pending/u,
    'truthful homepage adapter limitation',
  );
  assertMatches(
    source,
    /starring is\s+optional\. An issue or reproducible feedback is equally useful/u,
    'truthful homepage optional advocacy',
  );
  assert.doesNotMatch(
    source,
    /mergegrounds \/ audit|READ ONLY|detect\s+(?:<[^>]+>|\s)*stack|inspect\s+(?:<[^>]+>|\s)*controls|verify\s+(?:<[^>]+>|\s)*ownership|verify mutation\s+(?:<[^>]+>|\s)*report|No files changed\. Exit 2\.|read-only audit|Try the audit|Star on GitHub/iu,
    'truthful homepage must not retain the fictional audit or unconditional star CTA',
  );
});

check('getting-started begins with demo v1.0.1 before bootstrap', async () => {
  const source = await readSource('app/docs/getting-started/page.tsx');
  for (const token of [
    '90-second demo',
    'https://github.com/ExCoder/mergegrounds-demo/releases/tag/v1.0.1',
    'git clone --branch v1.0.1 --depth 1',
    'python3 demo.py',
    'DEMO PASSED: 1 admitted control; 5 negative controls denied',
    'Preview an existing Git repository; change nothing',
    'Alternative: start a new empty directory',
    '--allow-non-git',
    'CREATE',
    'CONFLICT',
    'Dry run only',
    'exits 0',
  ]) {
    assert.ok(source.includes(token), `truthful quickstart: missing ${token}`);
  }
  assertInOrder(
    source,
    [
      '1. Run the immutable 90-second demo',
      '2. Clone the reviewed core release',
      '3. Preview an existing Git repository; change nothing',
      '4. Review, then apply to the existing Git repository',
      '5. Alternative: start a new empty directory',
      '6. Seal, verify, and expect red',
    ],
    'truthful quickstart funnel',
  );
  assert.doesNotMatch(source, /read-only (?:repository )?audit/iu);
});

check(
  'community sends contributors to the truthful first-value path',
  async () => {
    const source = await readSource('app/community/page.tsx');
    assert.ok(source.includes('Run the demo and preview'));
    assertMatches(
      source,
      /time to first\s+demo and preview/u,
      'community first-value language',
    );
    assert.doesNotMatch(
      source,
      /Run the read-only audit|time to first audit/iu,
    );
  },
);

check('all nine inner routes use route-specific social metadata', async () => {
  assert.equal(routeFiles.size, 9);
  for (const [file, path] of routeFiles) {
    const source = await readSource(file);
    assertMatches(source, /createPageMetadata\s*\(\s*\{/u, `${file}: helper`);
    assert.ok(source.includes(`path: '${path}'`), `${file}: canonical path`);
    assertMatches(source, /title:\s*'[^']+'/u, `${file}: title`);
    assertMatches(
      source,
      /description:\s*\n?\s*'[^']+'/u,
      `${file}: description`,
    );
  }

  const helper = await readSource('app/page-metadata.ts');
  for (const token of [
    'alternates: { canonical: path }',
    'openGraph:',
    'url: path',
    'title',
    'description',
    "siteName: 'MergeGrounds'",
    "url: '/og.png'",
    'twitter:',
    "card: 'summary_large_image'",
    "images: ['/og.png']",
  ]) {
    assert.ok(helper.includes(token), `metadata helper: missing ${token}`);
  }
});

check('shared OG image remains byte-identical', async () => {
  const bytes = await readFile(projectFile('public/og.png'));
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    '14511970d0a712b948b29133b15ab89eb49a8ebffa28fc255ceb41abb3358c53',
  );
});

check('JSON-LD separates website and released core versions', async () => {
  const source = await readSource('app/layout.tsx');
  assert.ok(source.includes("const CORE_VERSION = '1.0.0'"));
  assertMatches(
    source,
    /'@type': 'WebSite',[\s\S]*?version: SITE_VERSION/u,
    'website JSON-LD version',
  );
  assertMatches(
    source,
    /'@type': 'SoftwareApplication',[\s\S]*?softwareVersion: CORE_VERSION/u,
    'software JSON-LD version',
  );
  assertMatches(
    source,
    /downloadUrl:\s*'https:\/\/github\.com\/ExCoder\/mergegrounds\/releases\/tag\/v1\.0\.0'/u,
    'released core download URL',
  );
  assert.doesNotMatch(
    source,
    /'@type': 'SoftwareApplication',[\s\S]*?softwareVersion: SITE_VERSION/u,
  );
});

check(
  'privacy page discloses Cloudflare security cookies explicitly',
  async () => {
    const source = await readSource('app/privacy/page.tsx');
    for (const token of [
      'Cloudflare',
      'strictly necessary',
      '__cf_bm',
      'cf_clearance',
      'bot',
    ]) {
      assert.ok(source.includes(token), `privacy disclosure: missing ${token}`);
    }
  },
);

check('root layout provides the skip link before page content', async () => {
  const source = await readSource('app/layout.tsx');
  assertInOrder(
    source,
    ['<body>', 'className="skip-link"', 'href="#main-content"', '{children}'],
    'root layout',
  );
});

check('homepage landmarks are header/nav then main then footer', async () => {
  const source = await readSource('app/page.tsx');
  assertInOrder(
    source,
    [
      '<header className="hero-shell">',
      '<nav ',
      '</header>',
      '<main id="main-content"',
      '</main>',
      '<footer>',
      '</footer>',
    ],
    'homepage landmarks',
  );
});

check(
  'content shell landmarks are header/nav then main then footer',
  async () => {
    const source = await readSource('app/content-shell.tsx');
    assertInOrder(
      source,
      [
        '<header',
        '<nav ',
        '</header>',
        '<main id="main-content"',
        '</main>',
        '<footer',
        '</footer>',
      ],
      'content landmarks',
    );
  },
);

check('generic divs never carry aria-label without a role', async () => {
  const files = [
    'app/layout.tsx',
    'app/page.tsx',
    'app/content-shell.tsx',
    ...routeFiles.keys(),
  ];
  for (const file of files) {
    const source = await readSource(file);
    assert.doesNotMatch(
      source,
      /<div\b(?=[^>]*\baria-label=)(?![^>]*\brole=)[^>]*>/u,
      file,
    );
  }
});

check('every decorative brand mark is hidden from assistive tech', async () => {
  for (const file of ['app/page.tsx', 'app/content-shell.tsx']) {
    const source = await readSource(file);
    const marks = [
      ...source.matchAll(/<span className="brand-mark"([^>]*)>/gu),
    ];
    assert.ok(marks.length >= 2, `${file}: expected header and footer marks`);
    for (const mark of marks) {
      assertMatches(mark[1], /aria-hidden="true"/u, file);
    }
  }
});

check(
  'known normal-text contrast failures use approved muted colors',
  async () => {
    const source = await readSource('app/globals.css');
    assert.ok(source.includes('--muted-on-paper: #66645e;'));
    assert.ok(source.includes('--muted-on-ink: #aaa89f;'));
    for (const selector of [
      '.check-index',
      '.terminal-muted',
      '.code-step > span',
      'footer > p',
    ]) {
      const block = source.match(
        new RegExp(
          `${selector.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
          'u',
        ),
      )?.[1];
      assert.ok(block, `${selector}: missing rule`);
      const expectedColor =
        selector === '.code-step > span'
          ? 'var(--muted-on-paper)'
          : 'var(--muted-on-ink)';
      assert.ok(
        block.includes(`color: ${expectedColor};`),
        `${selector}: color`,
      );
    }
  },
);

check(
  'smooth scrolling is enabled only when reduced motion is not requested',
  async () => {
    const source = await readSource('app/globals.css');
    const htmlRule = source.match(/html\s*\{([^}]*)\}/u)?.[1] ?? '';
    assert.ok(htmlRule.includes('scroll-behavior: auto;'));
    assertMatches(
      source,
      /@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?html\s*\{[\s\S]*?scroll-behavior: smooth;/u,
      'reduced-motion scroll rule',
    );
  },
);

check('mobile navigation preserves a visible Docs path', async () => {
  for (const file of ['app/page.tsx', 'app/content-shell.tsx']) {
    const source = await readSource(file);
    assertMatches(
      source,
      /className="mobile-docs-link"[\s\S]{0,100}href="\/docs\/getting-started"/u,
      file,
    );
  }
  const css = await readSource('app/globals.css');
  assertMatches(
    css,
    /@media \(max-width: 980px\)[\s\S]*?\.mobile-docs-link\s*\{[\s\S]*?display: inline-flex;/u,
    'mobile Docs CSS',
  );
});

check(
  'primary navigation and CTA touch targets are at least 44px',
  async () => {
    const source = await readSource('app/globals.css');
    assertMatches(
      source,
      /\.button\s*\{[\s\S]*?min-height: 54px;/u,
      'button touch target',
    );
    assertMatches(
      source,
      /\.brand,[\s\S]*?\.mobile-docs-link\s*\{[\s\S]*?min-height: 44px;/u,
      'navigation touch target',
    );
  },
);

check('mobile grids constrain min-content overflow', async () => {
  const source = await readSource('app/globals.css');
  assertMatches(
    source,
    /\.hero-grid > \*,\s*\.proof-section > \*,\s*\.quickstart-section > \*\s*\{\s*min-width: 0;/u,
    'mobile grid min-width guard',
  );
  assertMatches(
    source,
    /\.code-step > div\s*\{\s*min-width: 0;/u,
    'quickstart code min-width guard',
  );
});

check('not-found page is branded and links to Home and Docs', async () => {
  const source = await readSource('app/not-found.tsx');
  assert.ok(source.includes('ContentShell'));
  assertMatches(source, /href="\/"[\s\S]{0,100}>\s*Home/u, '404 Home link');
  assertMatches(
    source,
    /href="\/docs\/getting-started"[\s\S]{0,100}>\s*Docs/u,
    '404 Docs link',
  );
});

check('source identity rejects a fake build commit override', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ repositoryDirectory }) => {
    assert.throws(
      () =>
        identity.resolveSourceIdentity({
          environment: { MERGEGROUNDS_SITE_COMMIT: FAKE_COMMIT },
          repositoryDirectory,
        }),
      /MERGEGROUNDS_SITE_COMMIT.*explicit promotion/u,
    );
  });
});

check(
  'source identity ignores PATH and Git environment poisoning',
  async () => {
    const identity = await loadSourceIdentity();
    await withCleanGitFixture(
      async ({ fixtureRoot, head, repositoryDirectory }) => {
        const wrapperDirectory = join(fixtureRoot, 'hostile-path');
        const hostileGitDirectory = join(fixtureRoot, 'hostile-git-dir');
        await mkdir(wrapperDirectory);
        await mkdir(hostileGitDirectory);
        const wrapper = join(wrapperDirectory, 'git');
        await writeFile(wrapper, '#!/bin/sh\nexit 73\n');
        await chmod(wrapper, 0o755);

        const source = identity.resolveSourceIdentity({
          environment: {
            PATH: wrapperDirectory,
            GIT_DIR: hostileGitDirectory,
            GIT_WORK_TREE: hostileGitDirectory,
            GIT_CONFIG_GLOBAL: join(fixtureRoot, 'hostile.gitconfig'),
            GIT_CONFIG_SYSTEM: join(fixtureRoot, 'hostile-system.gitconfig'),
          },
          repositoryDirectory,
        });

        assert.deepEqual(source, { commit: head, dirty: false });
      },
    );
  },
);

check('source identity accepts a normal tracked index', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ head, repositoryDirectory }) => {
    assert.equal(
      runFixtureGit(repositoryDirectory, ['ls-files', '-v', '-z']),
      'H tracked.txt\0',
    );
    assert.deepEqual(
      identity.resolveSourceIdentity({ environment: {}, repositoryDirectory }),
      { commit: head, dirty: false },
    );
  });
});

check('source identity rejects assume-unchanged tracked bytes', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ head, repositoryDirectory }) => {
    runFixtureGit(repositoryDirectory, [
      'update-index',
      '--assume-unchanged',
      'tracked.txt',
    ]);
    await writeFile(join(repositoryDirectory, 'tracked.txt'), 'mutated\n');
    assert.equal(
      runFixtureGit(repositoryDirectory, ['status', '--porcelain']),
      '',
      'fixture must demonstrate the empty-status bypass',
    );
    assert.equal(
      runFixtureGit(repositoryDirectory, ['ls-files', '-v', '-z']),
      'h tracked.txt\0',
    );
    assert.throws(
      () =>
        identity.resolveSourceIdentity({
          environment: {
            MERGEGROUNDS_PROMOTION: 'true',
            MERGEGROUNDS_SITE_COMMIT: head,
          },
          repositoryDirectory,
        }),
      /non-normal Git index tag.*assume-unchanged/u,
    );
  });
});

check('source identity rejects skip-worktree tracked bytes', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ head, repositoryDirectory }) => {
    runFixtureGit(repositoryDirectory, [
      'update-index',
      '--skip-worktree',
      'tracked.txt',
    ]);
    await writeFile(join(repositoryDirectory, 'tracked.txt'), 'mutated\n');
    assert.equal(
      runFixtureGit(repositoryDirectory, ['status', '--porcelain']),
      '',
      'fixture must demonstrate the empty-status bypass',
    );
    assert.equal(
      runFixtureGit(repositoryDirectory, ['ls-files', '-v', '-z']),
      'S tracked.txt\0',
    );
    assert.throws(
      () =>
        identity.resolveSourceIdentity({
          environment: {
            MERGEGROUNDS_PROMOTION: 'true',
            MERGEGROUNDS_SITE_COMMIT: head,
          },
          repositoryDirectory,
        }),
      /non-normal Git index tag.*skip-worktree/u,
    );
  });
});

check(
  'source identity fails closed when trusted Git is unavailable',
  async () => {
    const identity = await loadSourceIdentity();
    await withCleanGitFixture(
      async ({ fixtureRoot, head, repositoryDirectory }) => {
        assert.throws(
          () =>
            identity.resolveSourceIdentity({
              environment: {
                CI: 'true',
                GITHUB_ACTIONS: 'true',
                GITHUB_EVENT_NAME: 'push',
                GITHUB_SHA: head,
              },
              gitBinary: join(fixtureRoot, 'missing-git'),
              repositoryDirectory,
            }),
          /trusted Git binary.*unavailable/u,
        );
      },
    );
  },
);

check('source identity rejects CI without trusted GitHub context', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ repositoryDirectory }) => {
    assert.throws(
      () =>
        identity.resolveSourceIdentity({
          environment: { CI: 'true' },
          repositoryDirectory,
        }),
      /CI source identity requires GitHub Actions context/u,
    );
  });
});

check('source identity rejects a mismatched GitHub Actions SHA', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ repositoryDirectory }) => {
    assert.throws(
      () =>
        identity.resolveSourceIdentity({
          environment: {
            CI: 'true',
            GITHUB_ACTIONS: 'true',
            GITHUB_EVENT_NAME: 'push',
            GITHUB_SHA: FAKE_COMMIT,
          },
          repositoryDirectory,
        }),
      /GITHUB_SHA does not match the actual repository HEAD/u,
    );
  });
});

check('source identity rejects a mismatched promotion SHA', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ repositoryDirectory }) => {
    assert.throws(
      () =>
        identity.resolveSourceIdentity({
          environment: {
            MERGEGROUNDS_PROMOTION: 'true',
            MERGEGROUNDS_SITE_COMMIT: FAKE_COMMIT,
          },
          repositoryDirectory,
        }),
      /promotion commit does not match the actual repository HEAD/u,
    );
  });
});

check(
  'source identity accepts exact clean CI and promotion commits',
  async () => {
    const identity = await loadSourceIdentity();
    await withCleanGitFixture(async ({ head, repositoryDirectory }) => {
      const ciSource = identity.resolveSourceIdentity({
        environment: {
          CI: 'true',
          GITHUB_ACTIONS: 'true',
          GITHUB_EVENT_NAME: 'push',
          GITHUB_SHA: head,
        },
        repositoryDirectory,
      });
      assert.deepEqual(ciSource, { commit: head, dirty: false });

      const promotionSource = identity.resolveSourceIdentity({
        environment: {
          MERGEGROUNDS_PROMOTION: 'true',
          MERGEGROUNDS_SITE_COMMIT: head,
        },
        repositoryDirectory,
      });
      assert.deepEqual(promotionSource, { commit: head, dirty: false });
    });
  },
);

check('source identity retains dirty local and CI behavior', async () => {
  const identity = await loadSourceIdentity();
  await withCleanGitFixture(async ({ head, repositoryDirectory }) => {
    await writeFile(join(repositoryDirectory, 'untracked.txt'), 'dirty\n');
    assert.deepEqual(
      identity.resolveSourceIdentity({ environment: {}, repositoryDirectory }),
      { commit: head, dirty: true },
    );
    assert.throws(
      () =>
        identity.resolveSourceIdentity({
          environment: {
            CI: 'true',
            GITHUB_ACTIONS: 'true',
            GITHUB_EVENT_NAME: 'push',
            GITHUB_SHA: head,
          },
          repositoryDirectory,
        }),
      /refusing a dirty CI or promotion build/u,
    );
  });
});

check('Vite consumes only the resolved repository identity', async () => {
  const vite = await readSource('vite.config.ts');
  assert.doesNotMatch(vite, /execFileSync/u);
  assert.doesNotMatch(vite, /process\.env\.MERGEGROUNDS_SITE_COMMIT/u);
  assert.ok(vite.includes('resolveSourceIdentity({'));
  assert.ok(vite.includes('repositoryDirectory'));
});

check('commit and dirty state share one sanitized Git snapshot', async () => {
  const identity = await readSource('scripts/source-identity.mjs');
  assert.equal(identity.match(/execFileSync\s*\(/gu)?.length, 1);
  for (const token of [
    "'status'",
    "'--porcelain=v2'",
    "'--branch'",
    "'-z'",
    'cwd: repositoryDirectory',
    'env: sanitizedGitEnvironment',
    "GIT_CONFIG_SYSTEM: '/dev/null'",
    "'core.hooksPath=/dev/null'",
    "'core.fsmonitor=false'",
    "'ls-files'",
    "'--cached'",
    "'--full-name'",
  ]) {
    assert.ok(identity.includes(token), `source snapshot: missing ${token}`);
  }
});

check('runtime homepage oracle kills a primary CTA href mutant', async () => {
  const runtime = await loadRuntimeContract();
  const expected = homepageFixture();
  const mutant = homepageFixture({ primaryHref: '/security' });

  assert.doesNotThrow(() => runtime.assertHomepageRuntimeContract(expected));
  assert.throws(
    () => runtime.assertHomepageRuntimeContract(mutant),
    /primary CTA.*\/docs\/getting-started/u,
  );
});

check('runtime homepage oracle kills clone and demo mutants', async () => {
  const runtime = await loadRuntimeContract();
  assert.doesNotThrow(() =>
    runtime.assertHomepageRuntimeContract(homepageFixture()),
  );
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture({ cloneRef: 'main' }),
      ),
    /reviewed clone command.*v1\.0\.0.*depth 1/u,
  );
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture({ demoRef: 'latest' }),
      ),
    /immutable demo CTA.*v1\.0\.1/u,
  );
});

check('runtime homepage oracle rejects fictional demo evidence', async () => {
  const runtime = await loadRuntimeContract();
  assert.doesNotThrow(() =>
    runtime.assertHomepageRuntimeContract(homepageFixture()),
  );
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture({
          demoCommand: 'python3 -I scripts/bootstrap.py --target .',
        }),
      ),
    /educational demo command.*python3 demo\.py/u,
  );
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture({
          demoSummary: 'DENY 2 activation requirements remain',
        }),
      ),
    /demo summary.*1 admitted control.*5 negative controls denied/u,
  );
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture().replace(
          'Educational model, not a repository audit or a production assurance claim.',
          'Example MergeGrounds audit ending in a denied decision.',
        ),
      ),
    /educational model.*not a repository audit/u,
  );
});

check(
  'runtime homepage oracle rejects unsupported stack and star claims',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.throws(
      () =>
        runtime.assertHomepageRuntimeContract(
          homepageFixture({
            stackLimitation: 'Bring your stack. Fully supported.',
          }),
        ),
      /adapter definitions.*end-to-end validation.*green fixtures.*pending/u,
    );
    assert.throws(
      () =>
        runtime.assertHomepageRuntimeContract(
          homepageFixture({ githubLabel: 'Star on GitHub' }),
        ),
      /GitHub source CTA.*View GitHub source/u,
    );
    assert.throws(
      () =>
        runtime.assertHomepageRuntimeContract(
          homepageFixture({ communityCopy: 'Please star the repository.' }),
        ),
      /starring.*optional.*issue.*feedback.*equally useful/u,
    );
  },
);

check(
  'runtime quickstart oracle enforces the truthful funnel order',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.doesNotThrow(() =>
      runtime.assertGettingStartedRuntimeContract(gettingStartedFixture()),
    );
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ firstStep: 'bootstrap' }),
        ),
      /demo.*before.*bootstrap preview/u,
    );
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ demoRef: 'latest' }),
        ),
      /immutable demo release.*v1\.0\.1/u,
    );
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ demoSummary: 'Everything passed.' }),
        ),
      /demo summary.*1 admitted control.*5 negative controls denied/u,
    );
  },
);

check(
  'runtime quickstart oracle requires the empty-directory preview flag',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.doesNotThrow(() =>
      runtime.assertGettingStartedRuntimeContract(gettingStartedFixture()),
    );
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ emptyPreviewFlag: '' }),
        ),
      /empty-directory preview.*--allow-non-git/u,
    );
  },
);

check(
  'runtime quickstart oracle requires the empty-directory apply flag',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ emptyApplyFlag: '' }),
        ),
      /empty-directory apply.*--allow-non-git/u,
    );
  },
);

check(
  'runtime quickstart oracle rejects doubled shell continuations',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.doesNotThrow(() =>
      runtime.assertGettingStartedRuntimeContract(gettingStartedFixture()),
    );
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ emptyContinuation: '\\'.repeat(2) }),
        ),
      /empty-directory.*exactly one trailing continuation backslash/u,
    );
  },
);

check(
  'runtime quickstart oracle keeps non-Git permission off existing repositories',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ existingPreviewFlag: '--allow-non-git' }),
        ),
      /existing Git preview.*must not use --allow-non-git/u,
    );
    assert.throws(
      () =>
        runtime.assertGettingStartedRuntimeContract(
          gettingStartedFixture({ existingApplyFlag: '--allow-non-git' }),
        ),
      /existing Git apply.*must not use --allow-non-git/u,
    );
  },
);

check(
  'runtime community oracle rejects stale audit labels despite decoys',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.doesNotThrow(() =>
      runtime.assertCommunityRuntimeContract(communityFixture()),
    );
    assert.throws(
      () =>
        runtime.assertCommunityRuntimeContract(
          communityFixture({ startLabel: 'Run the read-only audit' }),
        ),
      /community getting-started link.*Run the demo and preview/u,
    );
    assert.throws(
      () =>
        runtime.assertCommunityRuntimeContract(
          communityFixture({
            improvementCopy:
              'Reduce time to first audit without weakening the policy.',
          }),
        ),
      /community improvement path.*time to first demo and preview/u,
    );
  },
);

check(
  'runtime funnel scan rejects stale audit language on every route',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.doesNotThrow(() =>
      runtime.assertTruthfulFunnelAcrossRoutes(truthfulRouteFixtures()),
    );
    const mutant = truthfulRouteFixtures(
      new Map([
        [
          '/research',
          '<main><p>Reduce time to first audit.</p><script>Use the demo and preview.</script></main>',
        ],
      ]),
    );
    assert.throws(
      () => runtime.assertTruthfulFunnelAcrossRoutes(mutant),
      /\/research.*time to first audit/u,
    );
  },
);

check('runtime homepage oracle kills site/core JSON-LD mutants', async () => {
  const runtime = await loadRuntimeContract();
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture({ siteVersion: '1.0.0' }),
      ),
    /WebSite JSON-LD.*1\.2\.2/u,
  );
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture({ coreVersion: '1.2.2' }),
      ),
    /SoftwareApplication JSON-LD.*1\.0\.0/u,
  );
  assert.throws(
    () =>
      runtime.assertHomepageRuntimeContract(
        homepageFixture({ downloadRef: 'latest' }),
      ),
    /SoftwareApplication download.*v1\.0\.0/u,
  );
});

check(
  'runtime homepage oracle enforces landmarks and decorative marks',
  async () => {
    const runtime = await loadRuntimeContract();
    assert.doesNotThrow(() =>
      runtime.assertHomepageRuntimeContract(homepageFixture()),
    );
    assert.throws(
      () =>
        runtime.assertHomepageRuntimeContract(
          homepageFixture().replace('<main id="main-content">', '<div>'),
        ),
      /main landmark|header, nav, main, and footer landmarks/u,
    );
    assert.throws(
      () =>
        runtime.assertHomepageRuntimeContract(
          homepageFixture().replace(' aria-hidden="true"', ''),
        ),
      /decorative brand marks.*aria-hidden/u,
    );
  },
);

check('runtime metadata oracle kills the shared root URL mutant', async () => {
  const runtime = await loadRuntimeContract();
  const expectedPages = new Map(
    [...routeFiles.values()].map((path, index) => [
      path,
      metadataFixture(path, index),
    ]),
  );
  const mutantPages = new Map(
    [...routeFiles.values()].map((path, index) => [
      path,
      metadataFixture(path, index, '/'),
    ]),
  );

  assert.doesNotThrow(() => runtime.assertRouteMetadataContract(expectedPages));
  assert.throws(
    () => runtime.assertRouteMetadataContract(mutantPages),
    /canonical URL.*requested route/u,
  );
});

check(
  'privacy states Cloudflare cookie retention without claiming control',
  async () => {
    const source = await readSource('app/privacy/page.tsx');
    for (const token of [
      '30 minutes of continuous inactivity',
      'Cloudflare creates and manages these cookies',
    ]) {
      assert.ok(source.includes(token), `privacy retention: missing ${token}`);
    }
    assertMatches(
      source,
      /configured Cloudflare\s+Challenge Passage/u,
      'privacy Challenge Passage retention',
    );
    assert.ok(
      source.includes(
        'https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/',
      ),
    );
  },
);

check('runtime privacy oracle rejects vague cookie retention', async () => {
  const runtime = await loadRuntimeContract();
  const complete = `
    <main>
      <code>__cf_bm</code> expires after 30 minutes of continuous inactivity.
      <code>cf_clearance</code> duration follows the configured Cloudflare
      Challenge Passage. Cloudflare creates and manages these cookies.
      <a href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/">
        Cloudflare cookie documentation
      </a>
    </main>`;
  const vague = complete.replace(
    'expires after 30 minutes of continuous inactivity',
    'retention depends on configuration',
  );

  assert.doesNotThrow(() => runtime.assertPrivacyRetentionContract(complete));
  assert.throws(
    () => runtime.assertPrivacyRetentionContract(vague),
    /__cf_bm.*30 minutes of continuous inactivity/u,
  );
});

check('navigation normal and hover states retain 4.5:1 contrast', async () => {
  const runtime = await loadRuntimeContract();
  const css = await readSource('app/globals.css');
  const results = runtime.assertNavigationContrastContract(css);
  assert.equal(results.length, 6);
  for (const result of results) {
    assert.ok(
      result.ratio >= 4.5,
      `${result.selector} ${result.state}: ${result.ratio.toFixed(2)}:1`,
    );
  }
});

check('compiled CSS oracle kills undersized navigation targets', async () => {
  const runtime = await loadRuntimeContract();
  const css = await readSource('app/globals.css');
  const mutant = css.replace('min-height: 44px;', 'min-height: 20px;');
  assert.notEqual(mutant, css, 'touch-target mutant was not applied');
  assert.throws(
    () => runtime.assertNavigationContrastContract(mutant),
    /touch target.*at least 44px/u,
  );
});

check('runtime not-found oracle kills missing recovery links', async () => {
  const runtime = await loadRuntimeContract();
  const expected =
    '<header><nav></nav></header><main id="main-content"><h1>No grounds found here.</h1><a href="/">Home</a><a href="/docs/getting-started">Docs</a></main><footer></footer>';
  assert.doesNotThrow(() => runtime.assertNotFoundRuntimeContract(expected));
  assert.throws(
    () =>
      runtime.assertNotFoundRuntimeContract(
        expected.replace('href="/docs/getting-started"', 'href="/security"'),
      ),
    /not-found page.*Docs/u,
  );
});

check(
  'dirty builds remain usable locally but fail in CI and promotion',
  async () => {
    let identityPolicy;
    try {
      identityPolicy = await import('./source-identity.mjs?launch-contract');
    } catch {
      assert.fail('scripts/source-identity.mjs is missing');
    }

    assert.doesNotThrow(() =>
      identityPolicy.assertCleanBuildIdentity(true, {}),
    );
    assert.throws(
      () => identityPolicy.assertCleanBuildIdentity(true, { CI: 'true' }),
      /refusing a dirty CI or promotion build/u,
    );
    assert.throws(
      () =>
        identityPolicy.assertCleanBuildIdentity(true, {
          MERGEGROUNDS_PROMOTION: 'true',
        }),
      /refusing a dirty CI or promotion build/u,
    );
    assert.doesNotThrow(() =>
      identityPolicy.assertCleanBuildIdentity(false, {
        CI: 'true',
        MERGEGROUNDS_PROMOTION: 'true',
      }),
    );

    const vite = await readSource('vite.config.ts');
    assert.ok(vite.includes('resolveSourceIdentity({'));
  },
);

check('CI executes the dependency-free launch contract', async () => {
  const packageMetadata = JSON.parse(await readSource('package.json'));
  assert.equal(
    packageMetadata.scripts['check:launch'],
    'node scripts/check-launch-contract.mjs',
  );
  const workflow = await readSource('.github/workflows/ci.yml');
  assert.ok(workflow.includes('run: npm run check:launch'));
});

check('CI runs the compiled runtime contract after the build', async () => {
  const packageMetadata = JSON.parse(await readSource('package.json'));
  assert.equal(
    packageMetadata.scripts['check:runtime'],
    'node scripts/check-runtime-contract.mjs',
  );
  const workflow = await readSource('.github/workflows/ci.yml');
  assertInOrder(
    workflow,
    [
      '- name: Build',
      'run: npm run build',
      '- name: Verify runtime launch contract',
      'run: npm run check:runtime',
    ],
    'CI runtime order',
  );
});

check(
  'runtime preview execution is self-contained in a clean checkout',
  async () => {
    const runtimeCheck = await readSource('scripts/check-runtime-contract.mjs');
    assert.doesNotMatch(
      runtimeCheck,
      /join\(dirname\(repositoryDirectory\), ['"]mergegrounds['"]\)/u,
      'runtime check must not depend on a sibling core checkout',
    );
    assertMatches(
      runtimeCheck,
      /join\(fixtureDirectory, ['"]mergegrounds-fixture['"]\)/u,
      'runtime check must create a private core fixture',
    );
    assertMatches(
      runtimeCheck,
      /writeFile\([\s\S]*?bootstrap\.py[\s\S]*?--allow-non-git/u,
      'runtime check must install a constrained bootstrap fixture',
    );
  },
);

check(
  'security header verification runs under a hostile PATH Git shim',
  async () => {
    const packageMetadata = JSON.parse(await readSource('package.json'));
    assert.equal(
      packageMetadata.scripts['check:headers'],
      'node scripts/check-security-headers-path.mjs',
    );
    const headerCheck = await readSource('scripts/check-security-headers.mjs');
    assert.doesNotMatch(headerCheck, /execFileSync/u);
    assert.ok(headerCheck.includes('resolveSourceIdentity({'));
    const adversary = await readSource(
      'scripts/check-security-headers-path.mjs',
    );
    assert.ok(adversary.includes('MERGEGROUNDS_GIT_SHIM_MARKER'));
    assert.ok(adversary.includes('PATH: `${fixtureDirectory}:/usr/bin:/bin`'));
  },
);

let passed = 0;
let failed = 0;

for (const [index, { name, verify }] of checks.entries()) {
  try {
    await verify();
    passed += 1;
    console.log(`ok ${index + 1} - ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`not ok ${index + 1} - ${name}`);
    console.log(`  ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`1..${checks.length}`);
console.log(`# pass ${passed}`);
console.log(`# fail ${failed}`);

if (failed > 0) process.exitCode = 1;
