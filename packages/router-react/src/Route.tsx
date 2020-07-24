import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from './Outlet';
import { __DEV__ } from './constants';
import { IRouteProps } from './types';

/**
 * Declares an element that should be rendered at a certain URL path.
 */
export function Route({
  element = <Outlet />
}: IRouteProps): React.ReactElement | null {
  return element;
}

if (__DEV__) {
  Route.displayName = 'Route';
  Route.propTypes = {
    caseSensitive: PropTypes.bool,
    children: PropTypes.node,
    element: PropTypes.element,
    path: PropTypes.string
  };
}
