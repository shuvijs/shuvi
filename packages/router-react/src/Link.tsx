import * as React from 'react';
import * as PropTypes from 'prop-types';
import { useHref, useNavigate, useResolvedPath } from '.';
import { pathToString, State, PathRecord } from '@shuvi/router';
import { __DEV__ } from './constants';
import { useCurrentRoute, useIntersection } from './hooks';
import prefetchFn from './prefetch';
import { isAbsoluteUrl } from './utils';

function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * The public API for rendering a history-aware `<a>`.
 * ```ts
 * // jump to `/about`
 * <Link to="/about">About</Link>
 * // jump with query
 * <Link to="/about?sort=name">About</Link>
 * // with some state
 * <Link to="/about" state={{fromDashboard: true}}>About</Link>
 * // props `to` could be a object
 * <Link to={{
 *   pathname: "/about",
 *   search: "?sort=name",
 *   hash: "#the-hash",
 * }}>About</Link>
 * // props target '_self' | '_blank', default is '_self'
 * <Link to="/about" target="_self">About</Link>
 * // overrides default redirect mode by `replace`
 * <Link to="/about" replace>About</Link>
 * // if `onClick` function, run it first
 * <Link to="/about" onClick={fn}>About</Link>
 * // other props will be delivered to `<a>`
 * <Link to="/about" a='a' b='b'>About</Link> => <{...rest} a>
 * ```
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef(
    {
      onClick,
      replace: replaceProp = false,
      state,
      target,
      to,
      prefetch,
      onMouseEnter,
      ...rest
    },
    ref: any
  ) {
    let href = useHref(to);
    let navigate = useNavigate();
    const location = useCurrentRoute();
    let path = useResolvedPath(to);
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
        prefetchFn(href);
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
          prefetchFn(href);
        }
      }
    };

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
      if (onClick) onClick(event);
      if (
        !event.defaultPrevented && // onClick prevented default
        event.button === 0 && // Ignore everything but left clicks
        (!target || target === '_self') && // Let browser handle "target=_blank" etc.
        !isModifiedEvent(event) // Ignore clicks with modifier keys
      ) {
        event.preventDefault();

        // If the URL hasn't changed, a regular <a> will do a replace instead of
        // a push, so do the same here.
        let replace =
          !!replaceProp ||
          (location && pathToString(location)) === pathToString(path);

        navigate(to, { replace, state });
      }
    }
    return (
      // @ts-ignore
      <a
        {...rest}
        href={href}
        onClick={handleClick}
        target={target}
        {...childProps}
      />
    );
  }
);

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  replace?: boolean;
  state?: State;
  to: PathRecord;
  prefetch?: boolean;
  onMouseEnter?: (e: any) => void;
}

if (__DEV__) {
  Link.displayName = 'Link';
  Link.propTypes = {
    onClick: PropTypes.func,
    replace: PropTypes.bool,
    state: PropTypes.object,
    target: PropTypes.string,
    prefetch: PropTypes.bool,
    onMouseEnter: PropTypes.func,
    // @ts-ignore proptypes's bug?
    to: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        pathname: PropTypes.string,
        search: PropTypes.string,
        hash: PropTypes.string
      })
    ]).isRequired
  };
}
