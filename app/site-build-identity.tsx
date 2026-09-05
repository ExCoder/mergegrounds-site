declare const __MERGEGROUNDS_SITE_COMMIT__: string;
declare const __MERGEGROUNDS_SITE_DIRTY__: boolean;
declare const __MERGEGROUNDS_SITE_VERSION__: string;

export const SITE_COMMIT = __MERGEGROUNDS_SITE_COMMIT__;
export const SITE_DIRTY = __MERGEGROUNDS_SITE_DIRTY__;
export const SITE_VERSION = __MERGEGROUNDS_SITE_VERSION__;

export function SiteBuildIdentity() {
  const shortCommit = `${SITE_COMMIT.slice(0, 12)}${SITE_DIRTY ? '-dirty' : ''}`;

  return (
    <p className="site-build-identity">
      Site{' '}
      <a
        href={`https://github.com/ExCoder/mergegrounds-site/releases/tag/v${SITE_VERSION}`}
        rel="noreferrer"
      >
        v{SITE_VERSION}
      </a>{' '}
      · source{' '}
      {SITE_DIRTY ? (
        <span>{shortCommit}</span>
      ) : (
        <a
          href={`https://github.com/ExCoder/mergegrounds-site/commit/${SITE_COMMIT}`}
          rel="noreferrer"
        >
          {shortCommit}
        </a>
      )}
    </p>
  );
}
