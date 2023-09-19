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
      ? files.js.map(({ url, id }) => prefetchViaDom(url, id, 'script'))
      : []
  );
}

const isAbsoluteUrl = (url: string) => {
  return ABSOLUTE_URL_REGEX.test(url);
};

export const Link = function LinkWithPrefetch({
  to,
  ref,
  prefetch,
  onMouseEnter,
  ...rest
}: LinkWrapperProps) {
  const isHrefValid = typeof to === 'string' && !isAbsoluteUrl(to);
  const previousHref = React.useRef(to);
  const [setIntersectionRef, isVisible, resetVisible] = useIntersection({});
  const { router } = React.useContext(RouterContext);
  const setRef = React.useCallback(
    (el: Element) => {
      // Before the link getting observed, check if visible state need to be reset
      if (isHrefValid && previousHref.current !== to) {
        resetVisible();
        previousHref.current = to;
      }

      if (isHrefValid && prefetch !== false) setIntersectionRef(el);

      if (ref) {
        if (typeof ref === 'function') ref(el);
        else if (typeof ref === 'object') {
          ref.current = el;
        }
      }
    },
    [to, isHrefValid, prefetch, resetVisible, setIntersectionRef, ref]
  );

  React.useEffect(() => {
    const shouldPrefetch = isHrefValid && prefetch !== false && isVisible;
    if (shouldPrefetch && !prefetched[to]) {
      prefetchFn(router, to);
      prefetched[to] = true;
    }
  }, [to, prefetch, isVisible]);

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

interface LinkWrapperProps extends LinkProps {
  prefetch?: boolean;
  ref?: any;
}
