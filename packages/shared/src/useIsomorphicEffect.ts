import { useLayoutEffect, useEffect } from 'react';

export default function useIsomorphicEffect(cb: any, deps: any): void {
  if (typeof window !== 'undefined') {
    useLayoutEffect(cb, deps);
  } else {
    useEffect(cb, deps);
  }
}
