import {
  IRouterHistoryMode,
  IPageRouteConfig,
  IMiddlewareRouteConfig,
  IApiRouteConfig
} from '@shuvi/platform-shared/shared';

export interface IRouterConfig {
  history: IRouterHistoryMode | 'auto';
}

export interface PlatformWebCustomConfig {
  ssr: boolean;
  router: IRouterConfig;
  routes?: IPageRouteConfig[]; // generate by files what under src/pages or user defined
  middlewareRoutes?: IMiddlewareRouteConfig[];
  apiRoutes?: IApiRouteConfig[]; // generate by files what under src/apis or user defined
  conventionRoutes: {
    exclude?: string[];
  };
}
