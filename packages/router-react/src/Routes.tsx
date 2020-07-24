import React from 'react';
import PropTypes from 'prop-types';
import { createRoutesFromChildren } from './utils';
import { useRoutes_ } from './hooks';
import { __DEV__ } from './constants';
import { IRoutesProps } from './types';

/**
 * A container for a nested tree of <Route> elements that renders the branch
 * that best matches the current location.
 */
export function Routes({
  basename = '',
  children
}: IRoutesProps): React.ReactElement | null {
  let routes = createRoutesFromChildren(children);
  return useRoutes_(routes, basename);
}

if (__DEV__) {
  Routes.displayName = 'Routes';
  Routes.propTypes = {
    basename: PropTypes.string,
    children: PropTypes.node
  };
}
