import {
  History,
  IRouter,
  IRoute,
  IRouteRecord,
  IPartialRouteRecord,
  ResolvedPath,
  To,
  NavigationGuardHook,
  NavigationResolvedHook
} from './types';
import { matchRoutes } from './matchRoutes';
import { createRoutesFromArray } from './createRoutesFromArray';
import {
  normalizeBase,
  joinPaths,
  createEvents,
  resolvePath,
  Events
} from './utils';
import { isError } from './utils/error';
import { runQueue } from './utils/async';
import { extractHooks } from './utils/extract-hooks';

interface IRouterOptions<RouteRecord extends IPartialRouteRecord> {
  history: History;
  routes: RouteRecord[];
  caseSensitive?: boolean;
  basename?: string;
}

class Router<RouteRecord extends IRouteRecord> implements IRouter<RouteRecord> {
  private _basename: string;
  private _history: History;
  private _routes: RouteRecord[];
  private _current: IRoute<RouteRecord>;

  private _beforeEachs: Events<NavigationGuardHook> = createEvents<
    NavigationGuardHook
  >();

  private _afterEachs: Events<NavigationResolvedHook> = createEvents<
    NavigationResolvedHook
  >();

  constructor({ basename = '', history, routes }: IRouterOptions<RouteRecord>) {
    this._basename = normalizeBase(basename);
    this._history = history;
    this._routes = createRoutesFromArray(routes);
    this._current = this._getCurrent();
    this._history.listen(() => (this._current = this._getCurrent()));

    /*
      The Full Navigation Resolution Flow for shuvi/router
      1. Navigation triggered.
      2. Handle route.redirect if it has one
      3. Call router.beforeEach
      4. Call route.resolve
      5. Emit change event(trigger react update)
      6. Call router.afterEach
     */
    this._history.onTransistion = (to, completeTransistion) => {
      const nextRoute = this._getNextRoute(to);
      const current = this._getCurrent();

      const nextMatches = nextRoute.matches || [];
      const routeRedirect = nextMatches.reduceRight(
        (redirectPath, { route: { redirect } }) => {
          if (redirectPath) return redirectPath;
          if (redirect) {
            redirectPath = redirect;
          }
          return redirectPath;
        },
        ''
      );

      if (routeRedirect) {
        this.push(routeRedirect);
        return;
      }

      const queue = ([] as Array<NavigationGuardHook>).concat(
        this._beforeEachs.toArray(),
        extractHooks(nextMatches, 'resolve')
      );

      let abort = false;
      const iterator = (hook: NavigationGuardHook, next: Function) => {
        try {
          hook(nextRoute, current, to => {
            if (to === false) {
              abort = true;
            } else if (isError(to)) {
              abort = true;
            } else if (
              typeof to === 'string' ||
              (typeof to === 'object' && typeof to.path === 'string')
            ) {
              abort = true;
              if (typeof to === 'object') {
                if (to.replace) {
                  this.replace(to.path);
                } else {
                  this.push(to.path);
                }
              } else {
                this.push(to);
              }
            } else {
              next(to);
            }
          });
        } catch (err) {
          abort = true;
          console.error('Uncaught error during navigation:', err);
        }
      };

      runQueue(queue, iterator, () => {
        if (!abort) {
          completeTransistion();
          this._afterEachs.call(this._getCurrent(), current);
        }
      });
    };
  }

  get current(): IRoute<RouteRecord> {
    return this._current;
  }

  get action() {
    return this._history.action;
  }

  push(to: any, state?: any): void {
    this._history.push(to, state);
  }

  replace(to: any, state?: any) {
    this._history.replace(to, state);
  }

  go(delta: number) {
    this._history.go(delta);
  }

  back() {
    this._history.back();
  }

  forward() {
    this._history.forward();
  }

  block(blocker: any) {
    return this._history.block(blocker);
  }

  onChange(listener: any) {
    return this._history.listen(listener);
  }

  beforeEach(listener: NavigationGuardHook) {
    return this._beforeEachs.push(listener);
  }

  afterEach(listener: NavigationResolvedHook) {
    return this._afterEachs.push(listener);
  }

  resolve(to: To, from?: any): ResolvedPath {
    return this._history.resolve(
      to,
      from ? joinPaths([this._basename, from]) : this._basename
    );
  }

  private _getCurrent() {
    const {
      _routes: routes,
      _basename: basename,
      _history: { location }
    } = this;
    const matches = matchRoutes(routes, location, basename);
    const params = matches ? matches[matches.length - 1].params : {};
    return {
      matches,
      params,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      query: location.query,
      state: location.state
    };
  }

  private _getNextRoute(to: To): IRoute<RouteRecord> {
    const { _routes: routes, _basename: basename } = this;
    const matches = matchRoutes(routes, to, basename);
    const params = matches ? matches[matches.length - 1].params : {};
    const parsedPath = resolvePath(to);
    return {
      matches,
      params,
      ...parsedPath,
      state: null
    };
  }
}

export const createRouter = <RouteRecord extends IRouteRecord>(
  options: IRouterOptions<RouteRecord>
): IRouter<RouteRecord> => {
  return new Router(options);
};
