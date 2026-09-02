import {
  IRouterHistoryMode,
  IPageRouteConfig
} from '@shuvi/platform-shared/shared';

export interface IRouterConfig {
  history: IRouterHistoryMode | 'auto';
  /**
   * When true, path matching treats trailing slashes as significant. A request
   * whose pathname differs only by a trailing slash from a real route is
   * redirected (308) to the canonical URL instead of rendering the route.
   * Defaults to false for backward compatibility.
   */
  strictTrailingSlash?: boolean;
}

export interface PlatformWebCustomConfig {
  ssr: boolean;
  router: IRouterConfig;
  // generate by files what under src/pages or user defined
  routes?: IPageRouteConfig[];
  conventionRoutes: {
    include?: string[];
    exclude?: string[];
  };
}
