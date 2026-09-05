import { execFileSync } from 'node:child_process';
import {
  constants,
  accessSync,
  lstatSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { isAbsolute } from 'node:path';

const TRUSTED_GIT_BINARY = '/usr/bin/git';
const FULL_COMMIT = /^[0-9a-f]{40}$/u;
const GITHUB_EVENT = /^[a-z][a-z0-9_]*$/u;

const sanitizedGitEnvironment = Object.freeze({
  PATH: '/usr/bin:/bin',
  LANG: 'C',
  LC_ALL: 'C',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_PAGER: 'cat',
});

function enabled(environment, name) {
  const rawValue = environment[name];
  if (rawValue === undefined) return false;
  return !['', '0', 'false', 'no', 'off'].includes(
    String(rawValue).toLowerCase(),
  );
}

function assertFullCommit(value, label) {
  if (typeof value !== 'string' || !FULL_COMMIT.test(value)) {
    throw new Error(`${label} must be a full lowercase Git commit`);
  }
}

function validateTrustedGitBinary(gitBinary) {
  if (typeof gitBinary !== 'string' || !isAbsolute(gitBinary)) {
    throw new Error('trusted Git binary must use an absolute path');
  }

  let binaryMetadata;
  try {
    binaryMetadata = lstatSync(gitBinary);
    accessSync(gitBinary, constants.X_OK);
  } catch {
    throw new Error(`trusted Git binary is unavailable at ${gitBinary}`);
  }

  if (
    binaryMetadata.isSymbolicLink() ||
    !binaryMetadata.isFile() ||
    binaryMetadata.uid !== 0 ||
    (binaryMetadata.mode & 0o022) !== 0 ||
    realpathSync(gitBinary) !== gitBinary
  ) {
    throw new Error(
      `trusted Git binary at ${gitBinary} must be a root-owned, non-writable regular file`,
    );
  }
}

function resolveRepositoryDirectory(repositoryDirectory) {
  if (
    typeof repositoryDirectory !== 'string' ||
    !isAbsolute(repositoryDirectory)
  ) {
    throw new Error('repository directory must use an absolute path');
  }

  let resolvedDirectory;
  try {
    resolvedDirectory = realpathSync(repositoryDirectory);
  } catch {
    throw new Error('repository directory is unavailable');
  }

  if (!statSync(resolvedDirectory).isDirectory()) {
    throw new Error('repository directory must be a directory');
  }
  return resolvedDirectory;
}

function runTrustedGit(
  repositoryDirectory,
  gitBinary,
  arguments_,
  failureMessage,
) {
  try {
    return execFileSync(
      gitBinary,
      [
        '--no-pager',
        '-c',
        'core.hooksPath=/dev/null',
        '-c',
        'core.fsmonitor=false',
        '-c',
        'submodule.recurse=false',
        '-C',
        repositoryDirectory,
        ...arguments_,
      ],
      {
        cwd: repositoryDirectory,
        env: sanitizedGitEnvironment,
        maxBuffer: 4 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 10_000,
      },
    );
  } catch {
    throw new Error(failureMessage);
  }
}

function nullTerminatedRecords(output, label) {
  if (!Buffer.isBuffer(output) || (output.length > 0 && output.at(-1) !== 0)) {
    throw new Error(`trusted Git returned malformed ${label}`);
  }

  const records = [];
  let start = 0;
  while (start < output.length) {
    const end = output.indexOf(0, start);
    if (end <= start) {
      throw new Error(`trusted Git returned malformed ${label}`);
    }
    records.push(output.subarray(start, end));
    start = end + 1;
  }
  return records;
}

function readRepositoryIdentity(repositoryDirectory, gitBinary) {
  const status = runTrustedGit(
    repositoryDirectory,
    gitBinary,
    [
      'status',
      '--porcelain=v2',
      '--branch',
      '-z',
      '--untracked-files=all',
      '--ignore-submodules=none',
    ],
    'trusted Git could not read the repository source identity',
  );

  const records = nullTerminatedRecords(status, 'repository status');
  const commitPrefix = Buffer.from('# branch.oid ', 'ascii');
  const commitRecords = records.filter((record) =>
    record.subarray(0, commitPrefix.length).equals(commitPrefix),
  );
  if (commitRecords.length !== 1) {
    throw new Error('trusted Git returned an ambiguous repository HEAD');
  }

  const commit = commitRecords[0]
    .subarray(commitPrefix.length)
    .toString('ascii');
  assertFullCommit(commit, 'actual repository HEAD');

  return {
    commit,
    dirty: records.some((record) => record[0] !== 0x23),
  };
}

function assertNormalTrackedIndex(repositoryDirectory, gitBinary) {
  const index = runTrustedGit(
    repositoryDirectory,
    gitBinary,
    ['ls-files', '--cached', '--full-name', '-v', '-z', '--'],
    'trusted Git could not inspect the repository index',
  );
  const records = nullTerminatedRecords(index, 'repository index');

  // `git ls-files -v` documents H as a tracked entry that is neither
  // unmerged nor skip-worktree. Lowercase tags mean assume-unchanged. Sparse,
  // unmerged, and all other tags are rejected because they can hide bytes from
  // the status snapshot used to admit a build.
  for (const record of records) {
    if (record.length < 3 || record[1] !== 0x20) {
      throw new Error('trusted Git returned a malformed repository index tag');
    }
    const tag = String.fromCharCode(record[0]);
    if (tag === 'H') continue;

    const reason =
      tag >= 'a' && tag <= 'z'
        ? 'assume-unchanged'
        : tag === 'S'
          ? 'skip-worktree'
          : 'unsupported tracked state';
    throw new Error(
      `non-normal Git index tag rejected (${reason}); every tracked entry must use H`,
    );
  }
}

function assertTrustedBuildContext(commit, environment) {
  const ci = enabled(environment, 'CI');
  const promotion = enabled(environment, 'MERGEGROUNDS_PROMOTION');
  const suppliedPromotionCommit = environment.MERGEGROUNDS_SITE_COMMIT;

  if (suppliedPromotionCommit !== undefined && !promotion) {
    throw new Error(
      'MERGEGROUNDS_SITE_COMMIT is valid only for an explicit promotion',
    );
  }

  if (ci) {
    if (
      environment.GITHUB_ACTIONS !== 'true' ||
      typeof environment.GITHUB_EVENT_NAME !== 'string' ||
      !GITHUB_EVENT.test(environment.GITHUB_EVENT_NAME)
    ) {
      throw new Error('CI source identity requires GitHub Actions context');
    }
    assertFullCommit(environment.GITHUB_SHA, 'GITHUB_SHA');
    if (environment.GITHUB_SHA !== commit) {
      throw new Error('GITHUB_SHA does not match the actual repository HEAD');
    }
  }

  if (promotion) {
    assertFullCommit(suppliedPromotionCommit, 'promotion commit');
    if (suppliedPromotionCommit !== commit) {
      throw new Error(
        'promotion commit does not match the actual repository HEAD',
      );
    }
  }
}

export function assertCleanBuildIdentity(
  sourceDirty,
  environment = process.env,
) {
  if (
    sourceDirty &&
    (enabled(environment, 'CI') ||
      enabled(environment, 'MERGEGROUNDS_PROMOTION'))
  ) {
    throw new Error(
      'refusing a dirty CI or promotion build: commit the audited source before building',
    );
  }
}

/**
 * @param {{
 *   environment?: NodeJS.ProcessEnv;
 *   gitBinary?: string;
 *   repositoryDirectory: string;
 * }} options
 */
export function resolveSourceIdentity({
  environment = process.env,
  gitBinary = TRUSTED_GIT_BINARY,
  repositoryDirectory,
}) {
  validateTrustedGitBinary(gitBinary);
  const resolvedDirectory = resolveRepositoryDirectory(repositoryDirectory);
  const source = readRepositoryIdentity(resolvedDirectory, gitBinary);
  assertNormalTrackedIndex(resolvedDirectory, gitBinary);
  assertTrustedBuildContext(source.commit, environment);
  assertCleanBuildIdentity(source.dirty, environment);
  return source;
}
