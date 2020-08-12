import React from 'react';
import { IParams } from '@shuvi/router';
import { readOnly } from './utils';
import { __DEV__ } from './constants';
import { ILocationContextObject, IRouteContextObject } from './types';

export const LocationContext = React.createContext<ILocationContextObject>({
  static: false
} as ILocationContextObject);

if (__DEV__) {
  LocationContext.displayName = 'Location';
}

export const RouteContext = React.createContext<IRouteContextObject>({
  outlet: null,
  params: readOnly<IParams>({}),
  pathname: '',
  route: null
});

if (__DEV__) {
  RouteContext.displayName = 'Route';
}
