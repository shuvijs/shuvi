import React from 'react';
import {
  IApplicationCreaterBase,
  IAppRouteConfig,
  IAppRouteConfigWithPrivateProps,
  IViewClient,
  IAppComponent,
  IRouteComponent
} from '@shuvi/platform-core';

export interface IGetRoutes {
  (
    routes: IAppRouteConfigWithPrivateProps[],
    context: IApplicationCreaterBase
  ): IAppRouteConfig[];
}

export declare const getRoutes: IGetRoutes;
export declare const view: IViewClient;
export declare const app: IAppComponent<React.Component>;
export declare const page404: IRouteComponent<React.Component>;
