import React from 'react';
import { useOutlet } from './hooks';
import { __DEV__ } from './constants';

/**
 * Renders the child route's element, if there is one.
 */
export function Outlet(): React.ReactElement | null {
  return useOutlet();
}

if (__DEV__) {
  Outlet.displayName = 'Outlet';
  Outlet.propTypes = {};
}
