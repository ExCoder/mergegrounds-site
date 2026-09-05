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
npm run lint
npm run build
npm run check:headers
npm audit --audit-level=high
```

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
