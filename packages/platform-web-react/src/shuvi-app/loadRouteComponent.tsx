/// <reference lib="dom" />

import React from 'react';
import { Runtime } from '@shuvi/service';
import dynamic, { DynamicOptions } from './dynamic';

import RouteComponent = Runtime.IRouteComponent;

export function loadRouteComponent(
  loader: () => Promise<any>,
  options?: DynamicOptions<any>
) {
  const DynamicComp = dynamic<any>(
    () =>
      loader().then(mod => {
        const comp = mod.default || mod;
        if (comp.getInitialProps) {
          (DynamicComp as RouteComponent<React.ComponentType>).getInitialProps =
            comp.getInitialProps;
        }

        return comp;
      }),
    options
  );

  return DynamicComp;
}
