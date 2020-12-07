import { createContext } from 'react';
import { IParams, IRoute } from '@shuvi/router';
import { readOnly } from './utils';
import { __DEV__ } from './constants';
import { IRouterContextObject, IRouteContextObject } from './types';

export const RouterContext = createContext<IRouterContextObject>(
  null as any
);

if (__DEV__) {
  RouterContext.displayName = 'Router';
}

export const RouteContext = createContext<IRoute>(null as any);

if (__DEV__) {
  RouterContext.displayName = 'Route';
}

export const MactedRouteContext = createContext<IRouteContextObject>({
  depth: 0,
  params: readOnly<IParams>({}),
  pathname: '',
  route: null
});

if (__DEV__) {
  MactedRouteContext.displayName = 'MactedRoute';
}
