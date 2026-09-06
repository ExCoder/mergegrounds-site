# MergeGrounds site

The public landing page and compact documentation site for
[MergeGrounds](https://github.com/ExCoder/mergegrounds): open-source,
multi-stack, fail-closed admission control for AI-assisted code.

## Development

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

## Verification

```bash
npm run check:launch
npm run lint
npm run check:schemas
npm run build
npm run check:runtime
npm run check:headers
npm audit --omit=dev --audit-level=high
```

Build identity comes from one sanitized repository-status invocation using the
root-owned, non-writable `/usr/bin/git`; `PATH`, Git configuration environment,
hooks, and filesystem monitors cannot select the source identity. GitHub Actions
CI requires `GITHUB_SHA` to match the actual `HEAD`. An explicit promotion also
requires `MERGEGROUNDS_SITE_COMMIT` to match `HEAD`. CI and promotion builds
reject dirty worktrees; local builds remain available and visibly mark dirty
source. Environments without the reviewed `/usr/bin/git` fail closed and are not
currently supported.

`npm run check:runtime` starts the compiled Worker on an ephemeral loopback port
and verifies the rendered CTAs, pinned clone, JSON-LD versions, route metadata,
landmarks, branded 404, privacy retention disclosure, touch targets, and
navigation contrast. It also executes the rendered empty-directory preview shell
shape against a self-contained, no-write bootstrap fixture. That check validates
the compiled command and target-safety behavior; the core repository's own test
suite validates the real bootstrap implementation. Run the runtime check only
after `npm run build`. The header check also runs under a hostile `PATH` Git shim
and fails if that shim is consulted.

The application is built with Vinext and the OpenAI Sites Vite plugin for a
Cloudflare Workers-compatible deployment.

## Content policy

- Never claim that a tool can prove arbitrary code safe.
- Separate portable repository controls from maximum assurance, which requires
  an independently administered verifier and protected external settings.
- Date and source comparison claims.
- Publish benchmarks only with reproducible fixtures, versions, raw results,
  and limitations.
- Do not add repository paths, source code, or personal information to
  analytics.

## License

Apache-2.0. See [LICENSE](LICENSE).
