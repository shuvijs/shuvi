import * as React from 'react';
import * as PropTypes from 'prop-types';
import { useHref, useNavigate, useResolvedPath } from '.';
import { pathToString, State, PathRecord } from '@shuvi/router';
import { __DEV__ } from './constants';
import { useCurrentRoute } from './hooks';

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
const BaseLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function BaseLinkWithRef(
    { onClick, replace: replaceProp = false, state, target, to, ...rest },
    ref
  ) {
    let href = useHref(to);
    let navigate = useNavigate();
    const location = useCurrentRoute();
    let path = useResolvedPath(to);
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
        ref={ref}
        target={target}
      />
    );
  }
);

/**
 * @NOTE A Link wrapper to improve runtime error UX if `to` is not defined.
 *
 * At dev mode: Page crash directly
 *   -> show "Internal Application Error" page.
 *
 * At prod mode: Downgrade fatal error
 *   1. console.error first without page crash
 *   2. throw error after click
 *   3. re-render -> show "Internal Application Error" page
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef(props, ref) {
    const invalidPropTo = typeof props.to === 'undefined';
    if (invalidPropTo) {
      console.error(
        `The prop 'to' is required in '<Link>', but its value is 'undefined'`,
        JSON.stringify({ props })
      );
    }

    const [downgradeError, setDowngradeError] = React.useState(
      process.env.NODE_ENV === 'production'
    );

    if (downgradeError && invalidPropTo) {
      return (
        <a
          {...props}
          onClick={e => {
            e.preventDefault();
            setDowngradeError(false);
          }}
          ref={ref}
        />
      );
    }

    return <BaseLink {...props} ref={ref} />;
  }
);

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  replace?: boolean;
  state?: State;
  to: PathRecord;
}

if (__DEV__) {
  Link.displayName = 'Link';
  Link.propTypes = {
    replace: PropTypes.bool,
    state: PropTypes.object,
    target: PropTypes.string,
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
