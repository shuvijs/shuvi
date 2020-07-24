import React from 'react';
import { IParams } from '@shuvi/router';
import { __DEV__ } from './constants';
import { IRouteObject } from './types';
import invariant from '@shuvi/utils/lib/invariant';

export const readOnly: <T extends unknown>(obj: T) => T = __DEV__
  ? obj => Object.freeze(obj)
  : obj => obj;

export function warning(cond: boolean, message: string): void {
  if (!cond) {
    if (typeof console !== 'undefined') console.warn(message);

    try {
      // Welcome to debugging React Router!
      //
      // This error is thrown as a convenience so you can more easily
      // find the source for a warning that appears in the console by
      // enabling "pause on exceptions" in your JavaScript debugger.
      throw new Error(message);
    } catch (e) {}
  }
}

const alreadyWarned: Record<string, boolean> = {};
export function warningOnce(key: string, cond: boolean, message: string) {
  if (!cond && !alreadyWarned[key]) {
    alreadyWarned[key] = true;
    warning(false, message);
  }
}

/**
 * Creates a route config from a React "children" object, which is usually
 * either a `<Route>` element or an array of them. Used internally by
 * `<Routes>` to create a route config from its children.
 */
export function createRoutesFromChildren(
  children: React.ReactNode
): IRouteObject[] {
  let routes: IRouteObject[] = [];

  React.Children.forEach(children, element => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }

    if (element.type === React.Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children)
      );
      return;
    }

    let route: IRouteObject = {
      path: element.props.path || '/',
      caseSensitive: element.props.caseSensitive === true,
      // Default behavior is to just render the element that was given. This
      // permits people to use any element they prefer, not just <Route> (though
      // all our official examples and docs use <Route> for clarity).
      element
    };

    if (element.props.children) {
      let childRoutes = createRoutesFromChildren(element.props.children);
      if (childRoutes.length) {
        route.children = childRoutes;
      }
    }

    routes.push(route);
  });

  return routes;
}

/**
 * Returns a path with params interpolated.
 */
export function generatePath(path: string, params: IParams = {}): string {
  return path
    .replace(/:(\w+)/g, (_, key) => {
      invariant(params[key] != null, `Missing ":${key}" param`);
      return params[key];
    })
    .replace(/\/*\*$/, _ =>
      params['*'] == null ? '' : params['*'].replace(/^\/*/, '/')
    );
}

export { default as invariant } from '@shuvi/utils/lib/invariant';
