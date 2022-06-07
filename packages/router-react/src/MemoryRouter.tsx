import * as React from 'react';
import * as PropTypes from 'prop-types';
import { createMemoryHistory, IRouter, createRouter } from '@shuvi/router';
import { Router } from './Router';
import { __DEV__ } from './constants';
import { IMemoryRouterProps } from './types';

/**
 * a <Router> that stores all entries in memory.
 */
export function MemoryRouter({
  basename,
  children,
  routes,
  initialEntries,
  initialIndex
}: IMemoryRouterProps): React.ReactElement {
  let routerRef = React.useRef<IRouter>();
  if (routerRef.current == null) {
    routerRef.current = createRouter({
      basename,
      routes: routes || [],
      history: createMemoryHistory({ initialEntries, initialIndex })
    });
  }

  return <Router children={children} router={routerRef.current} />;
}

if (__DEV__) {
  MemoryRouter.displayName = 'MemoryRouter';
  MemoryRouter.propTypes = {
    children: PropTypes.node,
    routes: PropTypes.arrayOf(PropTypes.object),
    initialEntries: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          pathname: PropTypes.string,
          search: PropTypes.string,
          hash: PropTypes.string,
          state: PropTypes.object,
          key: PropTypes.string
        })
      ])
    ),
    initialIndex: PropTypes.number
  };
}
