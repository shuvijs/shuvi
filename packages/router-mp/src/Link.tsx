import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  useResolvedPath,
  useCurrentRoute,
  useNavigate
} from '@shuvi/router-react';
import { pathToString, State, PathRecord } from '@shuvi/router';
import { View } from '@tarojs/components';
import { __DEV__ } from './constants';

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
    let navigate = useNavigate();
    const location = useCurrentRoute();
    let path = useResolvedPath(to);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
      if (onClick) onClick(event);
      if (
        !event.defaultPrevented && // onClick prevented default
        !isModifiedEvent(event) // Ignore clicks with modifier keys
      ) {
        event.preventDefault();

        // If the URL hasn't changed, a regular <a> will do a replace instead of
        // a push, so do the same here.
        let replace =
          !!replaceProp ||
          pathToString(location) === pathToString(path) ||
          !target ||
          target === '_self';

        navigate(to, { replace, state });
      }
    }
    return (
      // @ts-ignore
      <View {...rest} ref={ref} onClick={handleClick} />
    );
  }
);

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  replace?: boolean;
  state?: State;
  to: PathRecord;
}

if (__DEV__) {
  Link.displayName = 'MpLink';
  Link.propTypes = {
    onClick: PropTypes.func,
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
