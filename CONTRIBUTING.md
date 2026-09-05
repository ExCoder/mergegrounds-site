# Contributing

Use an issue before a substantial information-architecture or branding change.
Keep claims narrow, sourced, and consistent with the core repository.

Before opening a pull request:

```bash
npm ci
npm run lint
npm run build
npm audit --audit-level=high
```

Include screenshots only when a visual change needs review. Never place
credentials, private repository details, customer code, or personal data in
fixtures, screenshots, analytics, issues, or pull requests.
