import * as React from 'react';
import {
  Link as LinkFromRouterReact,
  LinkProps,
  RouterContext
} from '@shuvi/router-react';
import {
  IRouter,
  PathRecord,
  getFilesOfRoute
} from '@shuvi/platform-shared/shared';
import useIntersection from './utils/useIntersection';
import { awaitPageLoadAndIdle } from '@shuvi/utils/idleCallback';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const prefetched: { [cacheKey: string]: boolean } = {};

function hasSupportPrefetch() {
  try {
    const link: HTMLLinkElement = document.createElement('link');
    return link.relList.supports('prefetch');
  } catch (e) {
    return false;
  }
}

function prefetchViaDom(href: string, id: string, as: string): Promise<any> {
  return new Promise<void>((res, rej) => {
    const selector = `
        link[rel="prefetch"][href^="${href}"],
        link[rel="preload"][href^="${href}"],
        script[src^="${href}"]`;
    if (document.querySelector(selector)) {
      return res();
    }

    const link = document.createElement('link');

    // The order of property assignment here is intentional:
    if (as) link.as = as;
    link.rel = `prefetch`;
    link.onload = res as any;
    link.onerror = rej;
    link.dataset.id = id;

    // `href` should always be last:
    link.href = href;

    document.head.appendChild(link);
  });
}

async function prefetchFn(router: IRouter, to: PathRecord): Promise<void> {
  const files = getFilesOfRoute(router, to);

  if (process.env.NODE_ENV !== 'production') return;
  if (typeof window === 'undefined') return;

  const canPrefetch: boolean = hasSupportPrefetch();
  await Promise.all(
    canPrefetch
      ? files.js.map(async ({ url, id }) => {
          await awaitPageLoadAndIdle({ remainingTime: 49, timeout: 10 * 1000 });
          await prefetchViaDom(url, id, 'script');
        })
      : []
  );
}

const isAbsoluteUrl = (url: string) => {
  return ABSOLUTE_URL_REGEX.test(url);
};

// Internal component with prefetch logic (contains hooks)
const LinkWithPrefetch = function ({
  to,
  ref,
  prefetch,
  onMouseEnter,
  ...rest
}: LinkWrapperProps) {
  const isHrefValid = typeof to === 'string' && !isAbsoluteUrl(to);
  const shouldAutoPrefetch = prefetch !== false;
  const previousHref = React.useRef(to);
  const isMountedRef = React.useRef(true);
  const { router } = React.useContext(RouterContext);
  const [setIntersectionRef, isVisible, resetVisible] = useIntersection({
    disabled: !shouldAutoPrefetch
  });

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setRef = React.useCallback(
    async (el: HTMLAnchorElement | null) => {
      // Handle unmount: cleanup IntersectionObserver
      if (!el) {
        setIntersectionRef(null);
        return;
      }

      if (shouldAutoPrefetch) {
        /**
         * Lazy prefetching to avoid negative performance impact for the first page.
         */
        await awaitPageLoadAndIdle({ remainingTime: 49, timeout: 10 * 1000 });

        // Check if component is still mounted after async operation
        if (!isMountedRef.current || !el.isConnected) return;

        // Before the link getting observed, check if visible state need to be reset
        if (isHrefValid && previousHref.current !== to) {
          resetVisible();
          previousHref.current = to;
        }

        if (isHrefValid) setIntersectionRef(el);
      }

      if (ref) {
        if (typeof ref === 'function') ref(el);
        else if (typeof ref === 'object') {
          ref.current = el;
        }
      }
    },
    [to, isHrefValid, shouldAutoPrefetch, resetVisible, setIntersectionRef, ref]
  );

  React.useEffect(() => {
    if (shouldAutoPrefetch && isHrefValid && isVisible && !prefetched[to]) {
      prefetchFn(router, to);
      prefetched[to] = true;
    }
  }, [to, isVisible, isHrefValid, shouldAutoPrefetch]);
  const childProps: {
    ref?: any;
    onMouseEnter: React.MouseEventHandler<HTMLAnchorElement>;
  } = {
    ref: setRef,
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (typeof onMouseEnter === 'function') {
        onMouseEnter(e);
      }
      if (isHrefValid && !prefetched[to]) {
        prefetchFn(router, to);
        prefetched[to] = true;
      }
    }
  };

  return <LinkFromRouterReact to={to} {...rest} {...childProps} />;
};

// Wrapper component (no hooks, safe to return early)
export const Link = function ({ prefetch, ...rest }: LinkWrapperProps) {
  // When prefetch is "none", completely disable all prefetching (auto + hover)
  if (prefetch === 'none') {
    return <LinkFromRouterReact {...rest} />;
  }

  // Otherwise use the full prefetch logic
  return <LinkWithPrefetch prefetch={prefetch} {...rest} />;
};

interface LinkWrapperProps extends LinkProps {
  /**
   * Controls link prefetching behavior:
   * - `undefined` or `true`: Auto prefetch when visible + hover prefetch (default)
   * - `false`: Disable auto prefetch, only prefetch on hover
   * - `'none'`: Completely disable all prefetching (no auto, no hover)
   */
  prefetch?: boolean | 'none';
  ref?: any;
}
