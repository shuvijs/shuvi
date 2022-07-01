/// <reference lib="dom" />

import * as React from 'react';
import dynamic, { DynamicOptions } from './dynamic';

export function loadRouteComponent(
  loader: () => Promise<any>,
  options?: DynamicOptions<any>
): React.ComponentType {
  const DynamicComp = dynamic<any>(
    () =>
      loader().then(mod => {
        const comp = mod.default || mod;
        return comp;
      }),
    options
  );

  return DynamicComp;
}
