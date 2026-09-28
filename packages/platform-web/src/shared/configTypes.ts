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
  /**
   * Run the initial hydration inside `startTransition`.
   *
   * `hydrateRoot` schedules the first hydration on `DefaultLane`, and
   * `includesBlockingLane` counts that as blocking, so React renders it through
   * `renderRootSync` — one uninterruptible task spanning the whole tree, which
   * is the same shape as the legacy `hydrate` it replaced. Suspense boundaries
   * do not break that up either: a boundary the server rendered completely is
   * hydrated inline in the same pass, and only the placeholders emitted by
   * `renderToPipeableStream` are deferred.
   *
   * A transition puts the work on a transition lane, which is not blocking, so
   * React takes `renderRootConcurrent` and yields between units of work. The
   * total CPU is unchanged; it is split into slices the browser can interleave
   * with input, which is what Total Blocking Time measures. The commit phase
   * stays synchronous, so a floor remains.
   *
   * Worth enabling in proportion to how much there is to hydrate: a large
   * server-rendered document gains, a small one does not. Requires React 18 —
   * with an earlier version this option has no effect.
   *
   * Defaults to false for backward compatibility.
   */
  hydrateInTransition?: boolean;
  // generate by files what under src/pages or user defined
  routes?: IPageRouteConfig[];
  conventionRoutes: {
    include?: string[];
    exclude?: string[];
  };
}
