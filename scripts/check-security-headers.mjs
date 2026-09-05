import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const port = Number.parseInt(process.env.MERGEGROUNDS_TEST_PORT ?? '8797', 10);
if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) {
  throw new Error(
    'MERGEGROUNDS_TEST_PORT must be an integer from 1024 to 65535',
  );
}

const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  '/',
  '/community',
  '/docs/ai-system-assurance',
  '/docs/expected-red',
  '/docs/getting-started',
  '/docs/trust-boundary',
  '/privacy',
  '/research',
  '/schemas',
  '/security',
  '/robots.txt',
  '/sitemap.xml',
];
const staticAssets = [
  '/favicon.svg',
  '/og.png',
  '/schemas/decision-v1.schema.json',
  '/schemas/evidence-v1.schema.json',
  '/schemas/policy-v1.schema.json',
  '/schemas/subject-v1.schema.json',
  '/schemas/waiver-v1.schema.json',
];
const expectedHeaders = new Map([
  [
    'content-security-policy',
    [
      "default-src 'self'",
      "base-uri 'none'",
      "connect-src 'self'",
      "font-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data:",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      'upgrade-insecure-requests',
    ].join('; '),
  ],
  ['cross-origin-opener-policy', 'same-origin'],
  ['permissions-policy', 'camera=(), geolocation=(), microphone=()'],
  ['referrer-policy', 'strict-origin-when-cross-origin'],
  ['strict-transport-security', 'max-age=31536000; includeSubDomains'],
  ['x-content-type-options', 'nosniff'],
  ['x-frame-options', 'DENY'],
]);

const wranglerPath = fileURLToPath(
  new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url),
);
const server = spawn(
  process.execPath,
  [
    wranglerPath,
    'dev',
    '--config',
    'dist/server/wrangler.json',
    '--ip',
    '127.0.0.1',
    '--port',
    String(port),
  ],
  {
    env: { ...process.env, NO_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

let serverOutput = '';
const collectOutput = (chunk) => {
  serverOutput = `${serverOutput}${chunk.toString()}`.slice(-20_000);
};
server.stdout.on('data', collectOutput);
server.stderr.on('data', collectOutput);

const serverExited = new Promise((resolve) => {
  server.once('exit', (code, signal) => resolve({ code, signal }));
});

async function waitUntilReady() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(
        `local server exited before it was ready\n${serverOutput}`,
      );
    }
    try {
      const response = await fetch(`${baseUrl}/`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
    } catch {
      // A refused connection is expected while Wrangler is starting.
    }
    await delay(250);
  }
  throw new Error(`local server did not become ready\n${serverOutput}`);
}

async function stopServer() {
  if (server.exitCode !== null) return;
  server.kill('SIGTERM');
  const stopped = await Promise.race([
    serverExited.then(() => true),
    delay(5_000).then(() => false),
  ]);
  if (!stopped) server.kill('SIGKILL');
}

try {
  await waitUntilReady();
  const homeResponse = await fetch(`${baseUrl}/`, {
    signal: AbortSignal.timeout(5_000),
  });
  const homeHtml = await homeResponse.text();
  const chunkPath = homeHtml.match(/src="(\/_next\/static\/[^"]+\.js)"/)?.[1];
  if (!chunkPath) {
    throw new Error('could not locate a production JavaScript chunk in /');
  }

  const checkedPaths = [...routes, ...staticAssets, chunkPath];
  for (const route of checkedPaths) {
    const response = await fetch(`${baseUrl}${route}`, {
      redirect: 'error',
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status !== 200) {
      throw new Error(`${route}: expected HTTP 200, got ${response.status}`);
    }
    for (const [name, expectedValue] of expectedHeaders) {
      const actualValue = response.headers.get(name);
      if (actualValue !== expectedValue) {
        throw new Error(
          `${route}: ${name} mismatch; expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`,
        );
      }
    }
  }
  console.log(
    `Verified ${expectedHeaders.size} security headers on ${checkedPaths.length} production routes and assets.`,
  );
} finally {
  await stopServer();
}
