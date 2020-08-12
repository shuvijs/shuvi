import * as React from 'react';
import PropTypes from 'prop-types';
import { useHref, useNavigate, useResolvedPath } from '.';
import { createPath, State, To } from '@shuvi/router';
import { __DEV__ } from './constants';
import { useRouter } from './hooks';

function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * The public API for rendering a history-aware <a>.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef(
    { onClick, replace: replaceProp = false, state, target, to, ...rest },
    ref
  ) {
    let href = useHref(to);
    let navigate = useNavigate();
    let { location } = useRouter();
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
          !!replaceProp || createPath(location) === createPath(path);

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

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  replace?: boolean;
  state?: State;
  to: To;
}

if (__DEV__) {
  Link.displayName = 'Link';
  Link.propTypes = {
    onClick: PropTypes.func,
    replace: PropTypes.bool,
    state: PropTypes.object,
    target: PropTypes.string,
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
