import React from 'react';
import { IParams } from '@shuvi/router';
import { readOnly } from './utils';
import { __DEV__ } from './constants';
import { IRouterContextObject, IRouteContextObject } from './types';

export const RouterContext = React.createContext<IRouterContextObject>(
  null as any
);

if (__DEV__) {
  RouterContext.displayName = 'Router';
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
