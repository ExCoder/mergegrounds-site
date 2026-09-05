import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:net';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import {
  INNER_ROUTES,
  assertCommunityRuntimeContract,
  assertGettingStartedRuntimeContract,
  assertHomepageRuntimeContract,
  assertNavigationContrastContract,
  assertNotFoundRuntimeContract,
  assertPrivacyRetentionContract,
  assertRouteMetadataContract,
  assertTruthfulFunnelAcrossRoutes,
  extractStylesheetHrefs,
} from './runtime-contract.mjs';

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = dirname(projectDirectory);
const wranglerEntry = join(
  repositoryDirectory,
  'node_modules',
  'wrangler',
  'bin',
  'wrangler.js',
);
const wranglerConfig = join(
  repositoryDirectory,
  'dist',
  'server',
  'wrangler.json',
);
const execFileAsync = promisify(execFile);

function shellQuote(value) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

async function assertEmptyDirectoryPreviewExecutes(command) {
  const fixtureDirectory = await mkdtemp(
    join(tmpdir(), 'mergegrounds-empty-preview-'),
  );
  const targetDirectory = join(fixtureDirectory, 'new-empty-project');
  const coreDirectory = join(fixtureDirectory, 'mergegrounds-fixture');
  const scriptsDirectory = join(coreDirectory, 'scripts');
  await mkdir(targetDirectory);
  await mkdir(scriptsDirectory, { recursive: true });
  await writeFile(
    join(scriptsDirectory, 'bootstrap.py'),
    [
      'import argparse',
      'import pathlib',
      '',
      'parser = argparse.ArgumentParser()',
      "parser.add_argument('--target', required=True)",
      "parser.add_argument('--allow-non-git', action='store_true')",
      "parser.add_argument('--apply', action='store_true')",
      'arguments = parser.parse_args()',
      'target = pathlib.Path(arguments.target)',
      "if arguments.apply: raise SystemExit('fixture refuses --apply')",
      "if not arguments.allow_non_git: raise SystemExit('missing --allow-non-git')",
      "if not target.is_dir(): raise SystemExit('target must be a directory')",
      "if any(target.iterdir()): raise SystemExit('target must be empty')",
      "print('Plan: create=1')",
      "print('Dry run only. Review conflicts, then rerun with --apply.')",
      '',
    ].join('\n'),
    { encoding: 'utf8', mode: 0o600 },
  );

  try {
    assert.equal(
      command.match(/\/absolute\/path\/to\/mergegrounds/gu)?.length ?? 0,
      1,
      'compiled empty-directory preview must contain one core placeholder',
    );
    assert.equal(
      command.match(/\/absolute\/path\/to\/new-empty-project/gu)?.length ?? 0,
      1,
      'compiled empty-directory preview must contain one target placeholder',
    );
    const executableCommand = command
      .replace('/absolute/path/to/mergegrounds', shellQuote(coreDirectory))
      .replace(
        '/absolute/path/to/new-empty-project',
        shellQuote(targetDirectory),
      );
    const { stderr, stdout } = await execFileAsync(
      '/bin/sh',
      ['-eu', '-c', executableCommand],
      {
        cwd: fixtureDirectory,
        encoding: 'utf8',
        env: {
          LANG: 'C',
          LC_ALL: 'C',
          PATH: '/usr/bin:/bin',
          PYTHONDONTWRITEBYTECODE: '1',
        },
        maxBuffer: 1_000_000,
        timeout: 10_000,
      },
    );
    assert.match(
      stdout,
      /^Plan: create=1$/mu,
      'compiled empty-directory preview must execute the fixture',
    );
    assert.match(
      stdout,
      /Dry run only/u,
      'compiled empty-directory preview must report Dry run only',
    );
    assert.equal(stderr, '', 'compiled empty-directory preview wrote stderr');
    assert.deepEqual(
      await readdir(targetDirectory),
      [],
      'compiled empty-directory preview must not write target files',
    );
  } finally {
    await rm(fixtureDirectory, { force: true, recursive: true });
  }
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen({ host: '127.0.0.1', port: 0 }, resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

function captureOutput(stream) {
  let output = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    output = `${output}${chunk}`.slice(-32_768);
  });
  return () => output;
}

async function fetchText(url, expectedType, expectedStatus = 200) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'MergeGrounds runtime contract' },
    redirect: 'error',
    signal: AbortSignal.timeout(5_000),
  });
  assert.equal(
    response.status,
    expectedStatus,
    `${url}: expected HTTP ${expectedStatus}`,
  );
  assert.match(
    response.headers.get('content-type') ?? '',
    expectedType,
    `${url}: unexpected content type`,
  );
  const body = await response.text();
  assert.ok(body.length > 0, `${url}: empty response`);
  assert.ok(body.length <= 1_000_000, `${url}: response exceeds 1 MB`);
  return body;
}

async function waitUntilReady(origin, exited) {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    if (exited.current) {
      throw new Error('compiled server exited before becoming ready');
    }
    try {
      return await fetchText(`${origin}/`, /text\/html/iu);
    } catch (error) {
      lastError = error;
      await delay(100);
    }
  }
  throw new Error(
    `compiled server did not become ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

async function stopServer(child, exitPromise) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([exitPromise, delay(3_000)]);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
    await exitPromise;
  }
}

async function run() {
  const stateDirectory = await mkdtemp(
    join(tmpdir(), 'mergegrounds-runtime-contract-'),
  );
  const port = await reservePort();
  let inspectorPort = await reservePort();
  while (inspectorPort === port) inspectorPort = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      wranglerEntry,
      'dev',
      '--config',
      wranglerConfig,
      '--ip',
      '127.0.0.1',
      '--port',
      String(port),
      '--inspector-port',
      String(inspectorPort),
      '--local',
      '--log-level=error',
      '--show-interactive-dev-session=false',
      '--persist-to',
      stateDirectory,
    ],
    {
      cwd: repositoryDirectory,
      env: {
        ...process.env,
        NO_COLOR: '1',
        WRANGLER_SEND_METRICS: 'false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const stdout = captureOutput(child.stdout);
  const stderr = captureOutput(child.stderr);
  const exited = { current: false };
  const exitPromise = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      exited.current = true;
      resolve({ code, signal });
    });
  });

  try {
    const homepage = await waitUntilReady(origin, exited);
    const pages = new Map(
      await Promise.all(
        INNER_ROUTES.map(async (path) => [
          path,
          await fetchText(`${origin}${path}`, /text\/html/iu),
        ]),
      ),
    );
    const notFound = await fetchText(
      `${origin}/runtime-contract-not-found`,
      /text\/html/iu,
      404,
    );
    const stylesheetHrefs = extractStylesheetHrefs(homepage);
    assert.ok(
      stylesheetHrefs.length > 0,
      'homepage has no compiled stylesheet',
    );
    const stylesheets = await Promise.all(
      stylesheetHrefs.map((href) => {
        const stylesheetUrl = new URL(href, `${origin}/`);
        assert.equal(
          stylesheetUrl.origin,
          origin,
          'compiled stylesheet must be same-origin',
        );
        return fetchText(stylesheetUrl.href, /text\/css/iu);
      }),
    );
    const compiledCss = stylesheets.join('\n');

    const checks = [
      {
        name: 'compiled homepage primary CTA',
        verify: () => assertHomepageRuntimeContract(homepage),
      },
      {
        name: 'compiled truthful demo and bootstrap funnel',
        verify: () =>
          assertGettingStartedRuntimeContract(
            pages.get('/docs/getting-started'),
          ),
      },
      {
        name: 'compiled empty-directory preview shell executes without writes',
        verify: async () => {
          const { emptyPreviewCommand } = assertGettingStartedRuntimeContract(
            pages.get('/docs/getting-started'),
          );
          await assertEmptyDirectoryPreviewExecutes(emptyPreviewCommand);
        },
      },
      {
        name: 'compiled truthful community first-value path',
        verify: () => assertCommunityRuntimeContract(pages.get('/community')),
      },
      {
        name: 'compiled truthful funnel language on every route',
        verify: () =>
          assertTruthfulFunnelAcrossRoutes(
            new Map([['/', homepage], ...pages.entries()]),
          ),
      },
      {
        name: 'compiled per-route canonical and social metadata',
        verify: () => assertRouteMetadataContract(pages),
      },
      {
        name: 'compiled Cloudflare cookie retention disclosure',
        verify: () => assertPrivacyRetentionContract(pages.get('/privacy')),
      },
      {
        name: 'compiled not-found recovery paths',
        verify: () => assertNotFoundRuntimeContract(notFound),
      },
      {
        name: 'compiled navigation normal and hover contrast',
        verify: () => assertNavigationContrastContract(compiledCss),
      },
    ];

    for (const [index, { name, verify }] of checks.entries()) {
      await Promise.resolve().then(verify);
      console.log(`ok ${index + 1} - ${name}`);
    }
    console.log(`1..${checks.length}`);
    console.log(`# pass ${checks.length}`);
    console.log('# fail 0');
  } catch (error) {
    const diagnostic = [stderr(), stdout()].filter(Boolean).join('\n');
    if (diagnostic) console.error(diagnostic);
    throw error;
  } finally {
    await stopServer(child, exitPromise);
    await rm(stateDirectory, { force: true, recursive: true });
  }
}

await run();
