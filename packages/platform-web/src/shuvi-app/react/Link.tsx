import * as React from 'react';
import {
  Link as LinkFromRouterReact,
  useHref,
  LinkProps
} from '@shuvi/router-react';
import useIntersection from './utils/useIntersection';
import { prefetchFn, isAbsoluteUrl } from './utils/prefetch';
import { getAppData } from '@shuvi/platform-shared/lib/runtime';

export const Link = function LinkWithPrefetch({
  prefetch,
  onMouseEnter,
  to,
  ref,
  ...rest
}: LinkWrapperProps) {
  const { clientManifestPath } = getAppData();
  const href = useHref(to);
  const previousHref = React.useRef<string>(href);
  const [setIntersectionRef, isVisible, resetVisible] = useIntersection({});
  const setRef = React.useCallback(
    (el: Element) => {
      // Before the link getting observed, check if visible state need to be reset
      if (previousHref.current !== href) {
        resetVisible();
        previousHref.current = href;
      }

      if (prefetch !== false) setIntersectionRef(el);

      if (ref) {
        if (typeof ref === 'function') ref(el);
        else if (typeof ref === 'object') {
          ref.current = el;
        }
      }
    },
    [href, resetVisible, setIntersectionRef, ref]
  );

  React.useEffect(() => {
    const shouldPrefetch =
      prefetch !== false && isVisible && !isAbsoluteUrl(href);
    if (shouldPrefetch) {
      prefetchFn(href, clientManifestPath);
    }
  }, [href, prefetch, isVisible]);

  const childProps: {
    ref?: any;
    onMouseEnter: React.MouseEventHandler;
  } = {
    ref: setRef,
    onMouseEnter: (e: React.MouseEvent) => {
      if (typeof onMouseEnter === 'function') {
        onMouseEnter(e);
      }
      if (!isAbsoluteUrl(href)) {
        prefetchFn(href, clientManifestPath);
      }
    }
  };

  return (
    <LinkFromRouterReact
      prefetch={prefetch}
      to={to}
      {...rest}
      {...childProps}
    />
  );
};

interface LinkWrapperProps extends LinkProps {
  ref?: any;
}
