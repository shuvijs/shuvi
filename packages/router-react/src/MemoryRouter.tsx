import React from 'react';
import PropTypes from 'prop-types';
import { MemoryHistory, createMemoryHistory } from '@shuvi/router';
import { Router } from './Router';
import { __DEV__ } from './constants';
import { IMemoryRouterProps } from './types';

/**
 * A <Router> that stores all entries in memory.
 */
export function MemoryRouter({
  children,
  initialEntries,
  initialIndex
}: IMemoryRouterProps): React.ReactElement {
  let historyRef = React.useRef<MemoryHistory>();
  if (historyRef.current == null) {
    historyRef.current = createMemoryHistory({ initialEntries, initialIndex });
  }

  return <Router children={children} history={historyRef.current} />;
}

if (__DEV__) {
  MemoryRouter.displayName = 'MemoryRouter';
  MemoryRouter.propTypes = {
    children: PropTypes.node,
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
