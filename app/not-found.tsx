import Link from 'next/link';
import { ContentShell } from './content-shell';
import { createPageMetadata } from './page-metadata';

export const metadata = createPageMetadata({
  path: '/404',
  title: 'Page not found — MergeGrounds',
  description:
    'The requested MergeGrounds page does not exist. Return home or open the documentation.',
});

export default function NotFound() {
  return (
    <ContentShell
      eyebrow="404 / NOT FOUND"
      title="No grounds found here."
      description="The requested path does not exist or has moved. The project overview and documentation are still available."
    >
      <h2>Choose a verified path</h2>
      <p>
        Return to the project overview, or start with the read-only quickstart.
      </p>
      <div className="not-found-actions">
        <Link className="button button-primary" href="/">
          Home
        </Link>
        <Link className="button button-secondary" href="/docs/getting-started">
          Docs
        </Link>
      </div>
    </ContentShell>
  );
}
