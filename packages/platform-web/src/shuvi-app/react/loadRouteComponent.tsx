/// <reference lib="dom" />

import * as React from 'react';
import { IRouteComponent } from '@shuvi/platform-shared/esm/runtime';
import dynamic, { DynamicOptions } from './dynamic';

export function loadRouteComponent(
  loader: () => Promise<any>,
  options?: DynamicOptions<any>
) {
  const DynamicComp = dynamic<any>(
    () =>
      loader().then(mod => {
        const comp = mod.default || mod;
        return comp;
      }),
    options
  ) as IRouteComponent<React.ComponentType>;

  return DynamicComp;
}
