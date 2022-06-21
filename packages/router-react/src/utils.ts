import { IParams, matchStringify } from '@shuvi/router';
import { useLayoutEffect, useEffect } from 'react';
import { __DEV__ } from './constants';

export function useIsomorphicEffect(cb: any, deps: any): void {
  if (typeof window !== 'undefined') {
    useLayoutEffect(cb, deps);
  } else {
    useEffect(cb, deps);
  }
}

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
 * Returns a path with params interpolated.
 */
export function generatePath(path: string, params: IParams = {}): string {
  return matchStringify(path, params);
}
