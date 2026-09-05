import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import { execFileSync } from 'node:child_process';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json' with { type: 'json' };
import packageMetadata from './package.json' with { type: 'json' };

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';
const sourceCommit =
  process.env.MERGEGROUNDS_SITE_COMMIT ??
  execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
const sourceDirty =
  execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    encoding: 'utf8',
  }).trim().length > 0;

if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
  throw new Error(
    'MERGEGROUNDS_SITE_COMMIT or git rev-parse HEAD must provide a full lowercase Git commit',
  );
}

const localBindingConfig = {
  main: 'vinext/server/fetch-handler',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    define: {
      __MERGEGROUNDS_SITE_COMMIT__: JSON.stringify(sourceCommit),
      __MERGEGROUNDS_SITE_DIRTY__: JSON.stringify(sourceDirty),
      __MERGEGROUNDS_SITE_VERSION__: JSON.stringify(packageMetadata.version),
    },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
