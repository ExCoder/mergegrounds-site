import { ArrowLeft, GitFork } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteBuildIdentity } from './site-build-identity';

export function ContentShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="content-page">
      <header className="content-header">
        <nav className="nav-wrap content-nav" aria-label="Content navigation">
          <Link className="brand" href="/" aria-label="MergeGrounds home">
            <span className="brand-mark" aria-hidden="true">
              MG//
            </span>
            <span>MergeGrounds</span>
          </Link>
          <Link className="back-link" href="/">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to overview
          </Link>
          <div className="nav-actions">
            <Link className="mobile-docs-link" href="/docs/getting-started">
              Docs
            </Link>
            <a
              className="nav-github"
              href="https://github.com/ExCoder/mergegrounds"
              rel="noreferrer"
            >
              <GitFork aria-hidden="true" size={17} />
              GitHub
            </a>
          </div>
        </nav>
        <div className="content-hero">
          <p className="section-number">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <article className="prose-shell">{children}</article>
      </main>
      <footer className="content-footer">
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            MG//
          </span>
          <span>MergeGrounds</span>
        </Link>
        <SiteBuildIdentity />
        <div>
          <Link href="/docs/getting-started">Docs</Link>
          <Link href="/research">Research</Link>
          <Link href="/security">Security</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/community">Community</Link>
        </div>
      </footer>
    </div>
  );
}
