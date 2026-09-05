import assert from 'node:assert/strict';

const SITE_ORIGIN = 'https://mergegrounds.chawax.chatgpt.site';
const SHARED_OG_IMAGE = `${SITE_ORIGIN}/og.png`;

export const INNER_ROUTES = Object.freeze([
  '/docs/ai-system-assurance',
  '/docs/expected-red',
  '/docs/getting-started',
  '/docs/trust-boundary',
  '/community',
  '/privacy',
  '/research',
  '/schemas',
  '/security',
]);

function decodeHtml(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replace(/&#(\d+);/gu, (_, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 10)),
    )
    .replace(/&#x([0-9a-f]+);/giu, (_, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16)),
    );
}

function parseAttributes(source) {
  const attributes = new Map();
  const pattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;
  for (const match of source.matchAll(pattern)) {
    attributes.set(
      match[1].toLowerCase(),
      decodeHtml(match[2] ?? match[3] ?? match[4] ?? ''),
    );
  }
  return attributes;
}

function matchingTags(html, tagName) {
  const pattern = new RegExp(
    `<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`,
    'giu',
  );
  return [...html.matchAll(pattern)].map((match) => ({
    attributes: parseAttributes(match[1]),
    content: match[2],
  }));
}

function matchingVoidTags(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, 'giu');
  return [...html.matchAll(pattern)].map((match) => parseAttributes(match[1]));
}

function textContent(html) {
  return decodeHtml(
    html
      .replace(/<!--([\s\S]*?)-->/gu, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, '')
      .replace(/<[^>]+>/gu, ' '),
  )
    .replace(/\s+/gu, ' ')
    .trim();
}

function renderedCodeText(html) {
  return decodeHtml(
    html.replace(/<!--([\s\S]*?)-->/gu, '').replace(/<[^>]+>/gu, ''),
  )
    .replace(/\r\n?/gu, '\n')
    .trim();
}

function one(values, label) {
  assert.equal(values.length, 1, `${label} must occur exactly once`);
  return values[0];
}

function tagsWithClass(html, tagName, className) {
  return matchingTags(html, tagName).filter((tag) =>
    (tag.attributes.get('class') ?? '').split(/\s+/u).includes(className),
  );
}

function assertTextInOrder(text, tokens, label) {
  let cursor = -1;
  for (const token of tokens) {
    const next = text.indexOf(token, cursor + 1);
    assert.notEqual(next, -1, `${label}: missing ${JSON.stringify(token)}`);
    assert.ok(
      next > cursor,
      `${label}: ${JSON.stringify(token)} is out of order`,
    );
    cursor = next;
  }
}

function assertSingleShellContinuations(command, label) {
  const lines = command.split('\n');
  assert.ok(lines.length >= 2, `${label} must be a multiline shell command`);
  for (const line of lines.slice(0, -1)) {
    assert.equal(
      line.match(/\\+$/u)?.[0] ?? '',
      '\\',
      `${label} must use exactly one trailing continuation backslash on every continued line`,
    );
  }
  assert.doesNotMatch(
    lines.at(-1) ?? '',
    /\\+$/u,
    `${label} final line must not have a continuation backslash`,
  );
}

const DEMO_SUMMARY =
  'DEMO PASSED: 1 admitted control; 5 negative controls denied';

const FICTIONAL_AUDIT_OUTPUT =
  /mergegrounds \/ audit|read-only (?:repository )?audit|detect stack|inspect controls|verify ownership|verify mutation report|DENY 2 activation requirements remain|No files changed\. Exit 2\.|Try the audit/iu;

const STALE_FUNNEL_LANGUAGE =
  /Run the read-only audit|time to first audit|read-only (?:repository )?audit/iu;

function assertDeterministicDemoOutput(text, label) {
  assert.match(
    text,
    /(?:^|\s)\$?\s*python3 demo\.py(?:\s|$)/u,
    `${label}: educational demo command must be python3 demo.py`,
  );
  assert.equal(
    text.match(/\bADMITTED\b/gu)?.length ?? 0,
    1,
    `${label}: output must contain exactly one ADMITTED control`,
  );
  assert.equal(
    text.match(/\bDENIED\b/gu)?.length ?? 0,
    5,
    `${label}: output must contain exactly five DENIED controls`,
  );
  assert.match(
    text,
    /DEMO PASSED: 1 admitted control; 5 negative controls denied/u,
    `${label}: demo summary must state 1 admitted control and 5 negative controls denied`,
  );
  assertTextInOrder(
    text,
    [
      'ADMITTED admitted complete exact evidence',
      'DENIED stale-evidence stale:evidence',
      'DENIED wrong-commit revision_mismatch:unit-tests',
      'DENIED incomplete-scope scope_mismatch:static-analysis',
      'DENIED survived-mutant survived_mutant',
      'DENIED missing-producer missing_producer:static-analysis',
      DEMO_SUMMARY,
    ],
    `${label}: deterministic output`,
  );
}

function metaContent(html, key, value) {
  const matches = matchingVoidTags(html, 'meta').filter(
    (attributes) => attributes.get(key) === value,
  );
  return one(matches, `${value} metadata`).get('content') ?? '';
}

function canonicalUrl(html) {
  const matches = matchingVoidTags(html, 'link').filter((attributes) =>
    (attributes.get('rel') ?? '')
      .split(/\s+/u)
      .some((token) => token.toLowerCase() === 'canonical'),
  );
  return one(matches, 'canonical link').get('href') ?? '';
}

function assertLandmarkContract(html, label) {
  const header = one(matchingTags(html, 'header'), `${label}: header landmark`);
  one(matchingTags(html, 'nav'), `${label}: nav landmark`);
  const main = one(matchingTags(html, 'main'), `${label}: main landmark`);
  one(matchingTags(html, 'footer'), `${label}: footer landmark`);

  const headerPosition = html.search(/<header\b/iu);
  const navPosition = html.search(/<nav\b/iu);
  const mainPosition = html.search(/<main\b/iu);
  const footerPosition = html.search(/<footer\b/iu);
  assert.ok(
    headerPosition >= 0 &&
      headerPosition < navPosition &&
      navPosition < mainPosition &&
      mainPosition < footerPosition &&
      /<nav\b/iu.test(header.content) &&
      main.attributes.get('id') === 'main-content',
    `${label}: header, nav, main, and footer landmarks must be ordered and main must be targetable`,
  );

  const genericLabelledDivs = matchingVoidTags(html, 'div').filter(
    (attributes) => attributes.has('aria-label') && !attributes.has('role'),
  );
  assert.equal(
    genericLabelledDivs.length,
    0,
    `${label}: labelled generic divs require an explicit role`,
  );
}

function assertDecorativeBrandMarks(html, label) {
  const brandMarks = matchingTags(html, 'span').filter((span) =>
    (span.attributes.get('class') ?? '').split(/\s+/u).includes('brand-mark'),
  );
  assert.ok(
    brandMarks.length >= 2,
    `${label}: decorative brand marks are missing`,
  );
  for (const mark of brandMarks) {
    assert.equal(
      mark.attributes.get('aria-hidden'),
      'true',
      `${label}: decorative brand marks must use aria-hidden`,
    );
  }
}

export function extractStylesheetHrefs(html) {
  return matchingVoidTags(html, 'link')
    .filter((attributes) =>
      (attributes.get('rel') ?? '')
        .split(/\s+/u)
        .some((token) => token.toLowerCase() === 'stylesheet'),
    )
    .map((attributes) => attributes.get('href') ?? '')
    .filter(Boolean);
}

export function assertHomepageRuntimeContract(html) {
  assertLandmarkContract(html, 'homepage');
  assertDecorativeBrandMarks(html, 'homepage');
  const skipLinks = matchingTags(html, 'a').filter((anchor) =>
    (anchor.attributes.get('class') ?? '').split(/\s+/u).includes('skip-link'),
  );
  const skipLink = one(skipLinks, 'homepage skip link');
  assert.equal(skipLink.attributes.get('href'), '#main-content');
  assert.equal(textContent(skipLink.content), 'Skip to main content');
  assert.ok(
    html.indexOf('class="skip-link"') < html.search(/<header\b/iu),
    'homepage skip link must precede the header',
  );

  const primaryButtons = matchingTags(html, 'a').filter((anchor) => {
    const classes = new Set(
      (anchor.attributes.get('class') ?? '').split(/\s+/u),
    );
    return classes.has('button') && classes.has('button-primary');
  });
  assert.ok(primaryButtons.length > 0, 'homepage primary CTA is missing');

  const primaryCta = primaryButtons[0];
  assert.equal(
    primaryCta.attributes.get('href'),
    '/docs/getting-started',
    'homepage primary CTA must open /docs/getting-started',
  );
  assert.equal(
    textContent(primaryCta.content),
    'Read the quickstart',
    'homepage primary CTA must say Read the quickstart',
  );

  const codeSamples = matchingTags(html, 'code').map((sample) =>
    textContent(sample.content),
  );
  assert.ok(
    codeSamples.includes(
      'git clone --branch v1.0.0 --depth 1 https://github.com/ExCoder/mergegrounds.git',
    ),
    'homepage reviewed clone command must pin v1.0.0 with --depth 1',
  );

  const immutableDemo = matchingTags(html, 'a').filter(
    (anchor) =>
      anchor.attributes.get('href') ===
        'https://github.com/ExCoder/mergegrounds-demo/releases/tag/v1.0.1' &&
      textContent(anchor.content) === 'Immutable demo v1.0.1',
  );
  assert.equal(
    immutableDemo.length,
    1,
    'homepage immutable demo CTA must link and label v1.0.1 exactly once',
  );

  const proof = one(
    tagsWithClass(html, 'section', 'proof-section'),
    'homepage educational proof section',
  );
  const proofText = textContent(proof.content);
  assert.match(
    proofText,
    /Educational model.*not a repository audit/iu,
    'homepage proof must identify an educational model that is not a repository audit',
  );
  assert.match(
    proofText,
    /not a production assurance claim/iu,
    'homepage proof must preserve the educational assurance boundary',
  );
  const terminal = one(
    tagsWithClass(proof.content, 'figure', 'terminal-window'),
    'homepage educational demo terminal',
  );
  assertDeterministicDemoOutput(
    textContent(terminal.content),
    'homepage educational demo',
  );
  assert.doesNotMatch(
    textContent(html),
    FICTIONAL_AUDIT_OUTPUT,
    'homepage must not publish fictional bootstrap audit behavior',
  );

  const stacks = one(
    tagsWithClass(html, 'section', 'stacks-section'),
    'homepage adapter definitions section',
  );
  const stacksText = textContent(stacks.content);
  assert.match(
    stacksText,
    /Included adapter definitions/iu,
    'homepage stack copy must label included adapter definitions',
  );
  assert.match(
    stacksText,
    /End-to-end validation.*(?:public )?green fixtures.*pending/iu,
    'homepage adapter definitions must say end-to-end validation and green fixtures are pending',
  );
  assert.doesNotMatch(
    stacksText,
    /Bring your stack|fully supported|supported stacks/iu,
    'homepage adapter definitions must not imply blanket stack support',
  );

  const quickstart = one(
    tagsWithClass(html, 'section', 'quickstart-section'),
    'homepage bootstrap preview section',
  );
  const quickstartText = textContent(quickstart.content);
  assert.match(
    quickstartText,
    /Preview first\. Change nothing\./u,
    'homepage bootstrap area must say Preview first. Change nothing.',
  );
  assert.match(
    quickstartText,
    /CREATE.*CONFLICT.*Dry run only.*exit(?:s| code)? 0/iu,
    'homepage bootstrap preview must describe CREATE/CONFLICT, Dry run only, and exit 0 behavior',
  );
  const quickstartSamples = matchingTags(quickstart.content, 'code').map(
    (sample) => textContent(sample.content),
  );
  const expectedQuickstartCommands = [
    'git clone --branch v1.0.0 --depth 1 https://github.com/ExCoder/mergegrounds.git',
    'python3 -I mergegrounds/scripts/bootstrap.py --target .',
    'python3 -I mergegrounds/scripts/bootstrap.py --target . --apply',
    'python3 -I scripts/mergegrounds.py verify-repo --strict',
  ];
  assert.deepEqual(
    quickstartSamples,
    expectedQuickstartCommands,
    'homepage bootstrap commands must progress from reviewed clone through preview, apply, and strict verify',
  );
  const expectedRedLinks = matchingTags(quickstart.content, 'a').filter(
    (anchor) => anchor.attributes.get('href') === '/docs/expected-red',
  );
  assert.equal(
    expectedRedLinks.length,
    1,
    'homepage verify step must link to the expected-red explanation',
  );
  assert.ok(
    html.indexOf(
      'https://github.com/ExCoder/mergegrounds-demo/releases/tag/v1.0.1',
    ) < html.indexOf('class="proof-section"') &&
      html.indexOf('class="proof-section"') <
        html.indexOf('class="quickstart-section"'),
    'homepage funnel must present immutable demo before bootstrap preview',
  );

  const community = one(
    tagsWithClass(html, 'section', 'community-section'),
    'homepage community section',
  );
  const communityText = textContent(community.content);
  const githubSourceCtas = matchingTags(community.content, 'a').filter(
    (anchor) =>
      anchor.attributes.get('href') ===
        'https://github.com/ExCoder/mergegrounds' &&
      textContent(anchor.content) === 'View GitHub source',
  );
  assert.equal(
    githubSourceCtas.length,
    1,
    'homepage GitHub source CTA must say View GitHub source',
  );
  assert.match(
    communityText,
    /If the demo or bootstrap preview delivered value.*starring is optional.*(?:issue.*feedback|feedback.*issue).*equally useful/iu,
    'homepage community copy must make starring conditional and optional, with issue feedback equally useful',
  );
  assert.doesNotMatch(
    communityText,
    /Star on GitHub/iu,
    'homepage must not use an unconditional Star on GitHub CTA',
  );

  const structuredDataScripts = matchingTags(html, 'script').filter(
    (script) => script.attributes.get('type') === 'application/ld+json',
  );
  const structuredDataScript = one(
    structuredDataScripts,
    'homepage JSON-LD script',
  );
  let structuredData;
  try {
    structuredData = JSON.parse(structuredDataScript.content);
  } catch {
    assert.fail('homepage JSON-LD must be valid JSON');
  }
  const graph = structuredData?.['@graph'];
  assert.ok(Array.isArray(graph), 'homepage JSON-LD must contain an @graph');
  const website = one(
    graph.filter((entry) => entry?.['@type'] === 'WebSite'),
    'homepage WebSite JSON-LD',
  );
  const application = one(
    graph.filter((entry) => entry?.['@type'] === 'SoftwareApplication'),
    'homepage SoftwareApplication JSON-LD',
  );
  assert.equal(
    website.version,
    '1.2.2',
    'homepage WebSite JSON-LD must expose site version 1.2.2',
  );
  assert.equal(
    application.softwareVersion,
    '1.0.0',
    'homepage SoftwareApplication JSON-LD must expose core version 1.0.0',
  );
  assert.equal(
    application.downloadUrl,
    'https://github.com/ExCoder/mergegrounds/releases/tag/v1.0.0',
    'homepage SoftwareApplication download must link released v1.0.0',
  );
}

export function assertGettingStartedRuntimeContract(html) {
  const documentTitle = textContent(
    one(matchingTags(html, 'title'), 'getting-started title').content,
  );
  assert.match(
    documentTitle,
    /90-second demo.*bootstrap/iu,
    'getting-started title must describe the demo and bootstrap path',
  );
  const description = metaContent(html, 'name', 'description');
  assert.match(
    description,
    /immutable v1\.0\.1 educational demo.*preview bootstrap.*review.*apply.*verify/iu,
    'getting-started metadata must describe demo, preview, apply, and verify',
  );
  assert.doesNotMatch(
    `${documentTitle} ${description}`,
    /read-only (?:repository )?audit/iu,
    'getting-started metadata must not advertise a repository audit',
  );

  const article = one(
    tagsWithClass(html, 'article', 'prose-shell'),
    'getting-started article',
  );
  const articleText = textContent(article.content);
  assert.doesNotMatch(
    articleText,
    FICTIONAL_AUDIT_OUTPUT,
    'getting-started must not publish fictional bootstrap audit behavior',
  );
  const sections = matchingTags(article.content, 'section');
  const section = (step) =>
    one(
      sections.filter(
        (candidate) => candidate.attributes.get('data-step') === step,
      ),
      `getting-started ${step} step`,
    );
  const demo = section('demo');
  const preview = section('preview');
  const apply = section('apply');
  const emptyDirectory = section('empty-directory');
  const verify = section('verify');
  assert.equal(
    sections[0]?.attributes.get('data-step'),
    'demo',
    'getting-started demo must be the first article step before bootstrap preview',
  );
  const positions = [
    'demo',
    'preview',
    'apply',
    'empty-directory',
    'verify',
  ].map((step) => article.content.indexOf(`data-step="${step}"`));
  assert.ok(
    positions.every((position) => position >= 0) &&
      positions.every(
        (position, index) => index === 0 || positions[index - 1] < position,
      ),
    'getting-started demo must come before bootstrap preview, reviewed apply, the empty-directory alternative, and verify',
  );

  const demoLinks = matchingTags(demo.content, 'a').filter(
    (anchor) =>
      anchor.attributes.get('href') ===
      'https://github.com/ExCoder/mergegrounds-demo/releases/tag/v1.0.1',
  );
  assert.equal(
    demoLinks.length,
    1,
    'getting-started immutable demo release must link v1.0.1 exactly',
  );
  const demoText = textContent(demo.content);
  assertTextInOrder(
    demoText,
    [
      'git clone --branch v1.0.1 --depth 1',
      'https://github.com/ExCoder/mergegrounds-demo.git',
      'python3 demo.py',
    ],
    'getting-started demo clone must pin v1.0.1 with --depth 1',
  );
  assertDeterministicDemoOutput(demoText, 'getting-started demo');

  const previewText = textContent(preview.content);
  assert.equal(
    preview.attributes.get('data-target-kind'),
    'existing-git',
    'getting-started preview must identify the existing Git path',
  );
  assert.match(
    previewText,
    /bootstrap\.py.*--target/iu,
    'getting-started preview must run bootstrap.py against a target',
  );
  assert.doesNotMatch(
    previewText,
    /--apply/u,
    'getting-started preview must not apply changes',
  );
  assert.doesNotMatch(
    previewText,
    /--allow-non-git/u,
    'getting-started existing Git preview must not use --allow-non-git',
  );
  assert.match(
    previewText,
    /CREATE.*CONFLICT.*Dry run only.*exit(?:s| code)? 0/iu,
    'getting-started preview must describe CREATE/CONFLICT, Dry run only, and exit 0 behavior',
  );

  const applyText = textContent(apply.content);
  assert.equal(
    apply.attributes.get('data-target-kind'),
    'existing-git',
    'getting-started apply must identify the existing Git path',
  );
  assert.match(
    applyText,
    /bootstrap\.py.*--target.*--apply/iu,
    'getting-started apply step must be explicitly reviewed before --apply',
  );
  assert.doesNotMatch(
    applyText,
    /--allow-non-git/u,
    'getting-started existing Git apply must not use --allow-non-git',
  );

  assert.equal(
    emptyDirectory.attributes.get('data-target-kind'),
    'new-empty-directory',
    'getting-started empty-directory path must be explicitly identified',
  );
  const emptyCommands = matchingTags(emptyDirectory.content, 'code')
    .map((sample) => renderedCodeText(sample.content))
    .filter((sample) => sample.includes('bootstrap.py'));
  assert.equal(
    emptyCommands.length,
    2,
    'getting-started empty-directory path must show separate preview and apply commands',
  );
  const emptyPreview = one(
    emptyCommands.filter((command) => !command.includes('--apply')),
    'getting-started empty-directory preview command',
  );
  const emptyApply = one(
    emptyCommands.filter((command) => command.includes('--apply')),
    'getting-started empty-directory apply command',
  );
  for (const [label, command] of [
    ['preview', emptyPreview],
    ['apply', emptyApply],
  ]) {
    assert.match(
      command,
      /bootstrap\.py[\s\S]*--target \/absolute\/path\/to\/new-empty-project/iu,
      `getting-started empty-directory ${label} must target the named empty directory`,
    );
    assert.match(
      command,
      /--allow-non-git/u,
      `getting-started empty-directory ${label} must include --allow-non-git`,
    );
    assert.equal(
      command.match(/--allow-non-git/gu)?.length ?? 0,
      1,
      `getting-started empty-directory ${label} must include --allow-non-git exactly once`,
    );
    assertSingleShellContinuations(
      command,
      `getting-started empty-directory ${label}`,
    );
  }
  const emptyDirectoryText = textContent(emptyDirectory.content);
  assert.match(
    emptyDirectoryText,
    /--allow-non-git.*(?:restricted|only).*existing, completely empty directory/iu,
    'getting-started must restrict --allow-non-git to an existing, completely empty directory',
  );
  assert.match(
    emptyDirectoryText,
    /(?:Never|Do not) use.*(?:existing Git repository|non-empty directory).*(?:non-empty directory|existing Git repository)/iu,
    'getting-started must reject --allow-non-git for existing Git and non-empty targets',
  );
  assert.match(
    textContent(verify.content),
    /verify-repo --strict/iu,
    'getting-started verify step must run strict repository verification',
  );
  assert.ok(
    matchingTags(verify.content, 'a').some(
      (anchor) => anchor.attributes.get('href') === '/docs/expected-red',
    ),
    'getting-started verify step must link the expected-red explanation',
  );
  assert.match(
    articleText,
    /Repository files alone.*not an active security boundary.*Maximum assurance.*separately administered verifier/iu,
    'getting-started must preserve the external assurance boundary',
  );

  return Object.freeze({
    emptyApplyCommand: emptyApply,
    emptyPreviewCommand: emptyPreview,
  });
}

export function assertCommunityRuntimeContract(html) {
  const article = one(
    tagsWithClass(html, 'article', 'prose-shell'),
    'community article',
  );

  const improvementSections = matchingTags(article.content, 'section').filter(
    (candidate) =>
      matchingTags(candidate.content, 'h3').some(
        (heading) => textContent(heading.content) === 'Improve the path',
      ),
  );
  const improvement = one(
    improvementSections,
    'community Improve the path section',
  );
  assert.match(
    textContent(improvement.content),
    /time to first demo and preview/iu,
    'community improvement path must describe time to first demo and preview',
  );

  const gettingStartedLinks = matchingTags(article.content, 'a').filter(
    (anchor) => anchor.attributes.get('href') === '/docs/getting-started',
  );
  const gettingStarted = one(
    gettingStartedLinks,
    'community getting-started link',
  );
  assert.equal(
    textContent(gettingStarted.content),
    'Run the demo and preview',
    'community getting-started link must say Run the demo and preview',
  );
  assert.doesNotMatch(
    textContent(article.content),
    STALE_FUNNEL_LANGUAGE,
    'community visible copy must not advertise the removed audit funnel',
  );
}

export function assertTruthfulFunnelAcrossRoutes(pages) {
  assert.ok(pages instanceof Map, 'truthful funnel pages must be a Map');
  const expectedRoutes = ['/', ...INNER_ROUTES].sort((left, right) =>
    left.localeCompare(right),
  );
  assert.deepEqual(
    [...pages.keys()].sort((left, right) =>
      String(left).localeCompare(String(right)),
    ),
    expectedRoutes,
    'truthful funnel scan must cover the homepage and all nine inner routes',
  );
  for (const path of ['/', ...INNER_ROUTES]) {
    const html = pages.get(path);
    assert.equal(typeof html, 'string', `${path}: rendered HTML is missing`);
    assert.doesNotMatch(
      textContent(html),
      STALE_FUNNEL_LANGUAGE,
      `${path}: visible funnel language must not say "time to first audit" or "read-only audit"`,
    );
  }
}

export function assertRouteMetadataContract(
  pages,
  { siteOrigin = SITE_ORIGIN } = {},
) {
  assert.ok(pages instanceof Map, 'route metadata pages must be a Map');
  assert.deepEqual(
    [...pages.keys()].sort((left, right) =>
      String(left).localeCompare(String(right)),
    ),
    [...INNER_ROUTES].sort((left, right) => left.localeCompare(right)),
    'runtime metadata must cover exactly the nine inner routes',
  );

  const titles = new Set();
  const descriptions = new Set();

  for (const path of INNER_ROUTES) {
    const html = pages.get(path);
    assert.equal(typeof html, 'string', `${path}: rendered HTML is missing`);
    const expectedUrl = new URL(path, `${siteOrigin}/`).href;
    assertLandmarkContract(html, path);
    assertDecorativeBrandMarks(html, path);
    const title = textContent(
      one(matchingTags(html, 'title'), `${path}: title`).content,
    );
    const description = metaContent(html, 'name', 'description');

    assert.ok(title.length >= 12, `${path}: title is too short`);
    assert.ok(description.length >= 40, `${path}: description is too short`);
    assert.equal(
      canonicalUrl(html),
      expectedUrl,
      `${path}: canonical URL must match the requested route`,
    );
    assert.equal(
      metaContent(html, 'property', 'og:url'),
      expectedUrl,
      `${path}: Open Graph URL must match the requested route`,
    );
    assert.equal(metaContent(html, 'property', 'og:title'), title);
    assert.equal(metaContent(html, 'property', 'og:description'), description);
    assert.equal(metaContent(html, 'property', 'og:image'), SHARED_OG_IMAGE);
    assert.equal(
      metaContent(html, 'name', 'twitter:card'),
      'summary_large_image',
    );
    assert.equal(metaContent(html, 'name', 'twitter:title'), title);
    assert.equal(metaContent(html, 'name', 'twitter:description'), description);
    assert.equal(metaContent(html, 'name', 'twitter:image'), SHARED_OG_IMAGE);

    assert.ok(!titles.has(title), `${path}: title duplicates another route`);
    assert.ok(
      !descriptions.has(description),
      `${path}: description duplicates another route`,
    );
    titles.add(title);
    descriptions.add(description);
  }
}

export function assertNotFoundRuntimeContract(html) {
  assertLandmarkContract(html, 'not-found page');
  const heading = one(matchingTags(html, 'h1'), 'not-found page heading');
  assert.equal(
    textContent(heading.content),
    'No grounds found here.',
    'not-found page must use the branded heading',
  );
  const anchors = matchingTags(html, 'a');
  assert.ok(
    anchors.some(
      (anchor) =>
        anchor.attributes.get('href') === '/' &&
        textContent(anchor.content) === 'Home',
    ),
    'not-found page must provide a Home recovery link',
  );
  assert.ok(
    anchors.some(
      (anchor) =>
        anchor.attributes.get('href') === '/docs/getting-started' &&
        textContent(anchor.content) === 'Docs',
    ),
    'not-found page must provide a Docs recovery link',
  );
}

export function assertPrivacyRetentionContract(html) {
  const text = textContent(html);
  assert.match(
    text,
    /__cf_bm expires after 30 minutes of continuous inactivity/u,
    '__cf_bm retention must state 30 minutes of continuous inactivity',
  );
  assert.match(
    text,
    /cf_clearance duration follows the configured Cloudflare Challenge Passage/u,
    'cf_clearance retention must reference the configured Challenge Passage',
  );
  assert.match(
    text,
    /Cloudflare creates and manages these cookies/u,
    'the page must identify Cloudflare as the cookie manager',
  );
  assert.doesNotMatch(
    text,
    /MergeGrounds (?:controls|creates|manages|sets) (?:these|the) cookies/iu,
    'the page must not claim MergeGrounds controls Cloudflare cookies',
  );

  const officialDocumentation = matchingTags(html, 'a').filter(
    (anchor) =>
      anchor.attributes.get('href') ===
      'https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/',
  );
  assert.ok(
    officialDocumentation.length > 0,
    'privacy retention must link to Cloudflare cookie documentation',
  );
}

function cssRules(css) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gu)].map((match) => ({
    selectors: match[1].split(',').map((selector) => {
      const trimmed = selector.trim();
      return trimmed.slice(trimmed.lastIndexOf(';') + 1).trim();
    }),
    declarations: Object.fromEntries(
      match[2]
        .split(';')
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .map((declaration) => {
          const separator = declaration.indexOf(':');
          return [
            declaration.slice(0, separator).trim(),
            declaration.slice(separator + 1).trim(),
          ];
        })
        .filter(([property]) => property),
    ),
  }));
}

function declarationsFor(rules, selector) {
  return Object.assign(
    {},
    ...rules
      .filter((rule) => rule.selectors.includes(selector))
      .map((rule) => rule.declarations),
  );
}

function colorFromCss(value, variables, label) {
  const variableName = value?.match(/var\((--[a-z0-9-]+)\)/iu)?.[1];
  const resolved = variableName ? variables[variableName] : value;
  const color = resolved?.match(/#[0-9a-f]{6}\b/iu)?.[0];
  assert.ok(color, `${label} must resolve to a six-digit hex color`);
  return color;
}

function rgb(hex) {
  return [1, 3, 5].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16),
  );
}

function composite(foreground, background, opacity) {
  return foreground.map((channel, index) =>
    Math.round(channel * opacity + background[index] * (1 - opacity)),
  );
}

function luminance(color) {
  const channels = color.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function assertNavigationContrastContract(css) {
  const rules = cssRules(css);
  const variables = declarationsFor(rules, ':root');
  const body = declarationsFor(rules, 'body');
  const defaultForeground = colorFromCss(body.color, variables, 'body color');
  const defaultBackground = colorFromCss(
    body['background-color'] ?? body.background,
    variables,
    'body background',
  );
  const background = rgb(defaultBackground);
  const results = [];

  for (const selector of ['.nav-links a', '.nav-github', '.mobile-docs-link']) {
    const normal = declarationsFor(rules, selector);
    const hover = {
      ...normal,
      ...declarationsFor(rules, `${selector}:hover`),
    };

    for (const [state, declarations] of [
      ['normal', normal],
      ['hover', hover],
    ]) {
      const foreground = rgb(
        colorFromCss(
          declarations.color ?? defaultForeground,
          variables,
          `${selector} ${state} color`,
        ),
      );
      const opacity = Number.parseFloat(declarations.opacity ?? '1');
      assert.ok(
        Number.isFinite(opacity) && opacity >= 0 && opacity <= 1,
        `${selector} ${state} opacity is invalid`,
      );
      const ratio = contrast(
        composite(foreground, background, opacity),
        background,
      );
      results.push({ ratio, selector, state });
      assert.ok(
        ratio >= 4.5,
        `${selector} ${state} contrast is ${ratio.toFixed(2)}:1; expected at least 4.5:1`,
      );
    }
  }

  for (const selector of [
    '.brand',
    '.nav-links a',
    '.nav-github',
    '.back-link',
    '.mobile-docs-link',
    '.button',
  ]) {
    const declarations = declarationsFor(rules, selector);
    const minHeight = Number.parseFloat(declarations['min-height'] ?? '0');
    assert.ok(
      Number.isFinite(minHeight) && minHeight >= 44,
      `${selector} touch target must be at least 44px high`,
    );
  }

  assert.equal(
    declarationsFor(rules, '.mobile-docs-link').display,
    'inline-flex',
    'compiled mobile CSS must expose the Docs path',
  );

  return results;
}
