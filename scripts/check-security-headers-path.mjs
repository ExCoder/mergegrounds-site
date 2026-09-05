import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { access, chmod, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = dirname(scriptsDirectory);

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

async function run() {
  const fixtureDirectory = await mkdtemp(
    join(tmpdir(), 'mergegrounds-hostile-git-'),
  );
  const shim = join(fixtureDirectory, 'git');
  const marker = join(fixtureDirectory, 'git-was-invoked');

  try {
    await writeFile(
      shim,
      '#!/bin/sh\n: > "$MERGEGROUNDS_GIT_SHIM_MARKER"\nexec /usr/bin/true "$@"\n',
    );
    await chmod(shim, 0o755);
    const port = await reservePort();
    let inspectorPort = await reservePort();
    while (inspectorPort === port) inspectorPort = await reservePort();
    const child = spawn(
      process.execPath,
      [join(scriptsDirectory, 'check-security-headers.mjs')],
      {
        cwd: repositoryDirectory,
        env: {
          ...process.env,
          MERGEGROUNDS_GIT_SHIM_MARKER: marker,
          MERGEGROUNDS_INSPECTOR_PORT: String(inspectorPort),
          MERGEGROUNDS_TEST_PORT: String(port),
          PATH: `${fixtureDirectory}:/usr/bin:/bin`,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let output = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    const collect = (chunk) => {
      output = `${output}${chunk}`.slice(-32_768);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    const { code, signal } = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (exitCode, exitSignal) =>
        resolve({ code: exitCode, signal: exitSignal }),
      );
    });
    assert.equal(
      code,
      0,
      `security header check failed (${signal ?? code})\n${output}`,
    );
    await assert.rejects(
      access(marker),
      /ENOENT/u,
      'hostile PATH git shim was executed',
    );
    process.stdout.write(output);
    console.log(
      'Verified security header check ignores hostile PATH Git shims.',
    );
  } finally {
    await rm(fixtureDirectory, { force: true, recursive: true });
  }
}

await run();
