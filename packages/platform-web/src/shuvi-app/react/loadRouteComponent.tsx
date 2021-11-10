/// <reference lib="dom" />

import React from 'react';
import { IRouteComponent } from '@shuvi/platform-core';
import dynamic, { DynamicOptions } from './dynamic';

export function loadRouteComponent(
  loader: () => Promise<any>,
  options?: DynamicOptions<any>
) {
  const DynamicComp = dynamic<any>(
    () =>
      loader().then(mod => {
        const comp = mod.default || mod;
        if (comp.getInitialProps) {
          (
            DynamicComp as IRouteComponent<React.ComponentType>
          ).getInitialProps = comp.getInitialProps;
        }

        return comp;
      }),
    options
  );

  return DynamicComp;
}
