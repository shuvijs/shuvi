import { Defer } from '@shuvi/utils/lib/defer';
import {
  IRouter,
  IRoute,
  IRouteRecord,
  IPartialRouteRecord,
  ResolvedPath,
  PathRecord,
  NavigationGuardHook,
  NavigationResolvedHook,
  Listener
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
import History from './history/base';
import { getRedirectFromRoutes } from './getRedirectFromRoutes';

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
  private _pending: PathRecord | null = null;
  private _ready: boolean = false;
  private _readyDefer: Defer = Defer<void>();

  private _listeners: Events<Listener> = createEvents();
  private _beforeEachs: Events<NavigationGuardHook> = createEvents();
  private _afterEachs: Events<NavigationResolvedHook> = createEvents();

  constructor({ basename = '', history, routes }: IRouterOptions<RouteRecord>) {
    this._basename = normalizeBase(basename);
    this._history = history;
    this._routes = createRoutesFromArray(routes);
    this._current = this._getCurrent();
    this._history.doTransision = this._doTransition.bind(this);

    const setup = () => this._history.setup();
    this._history.transitionTo(this._current, {
      onTransition: setup,
      onAbort: setup
    });
  }

  get ready() {
    return this._readyDefer.promise;
  }

  get current(): IRoute<RouteRecord> {
    return this._current;
  }

  get action() {
    return this._history.action;
  }

  push(to: any, state?: any) {
    return this._history.push(to, { state });
  }

  replace(to: any, state?: any) {
    return this._history.replace(to, { state });
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

  listen(listener: any) {
    return this._listeners.push(listener);
  }

  beforeEach(listener: NavigationGuardHook) {
    return this._beforeEachs.push(listener);
  }

  afterEach(listener: NavigationResolvedHook) {
    return this._afterEachs.push(listener);
  }

  resolve(to: PathRecord, from?: any): ResolvedPath {
    return this._history.resolve(
      to,
      from ? joinPaths([this._basename, from]) : this._basename
    );
  }

  /*
    The Full Navigation Resolution Flow for shuvi/router
    1. Navigation triggered.
    2. Handle route.redirect if it has one
    3. Call router.beforeEach
    4. Call route.resolve
    5. Emit change event(trigger react update)
    6. Call router.afterEach
    */
  private _doTransition(
    to: PathRecord,
    onComplete: Function,
    onAbort?: Function
  ) {
    const nextRoute = this._getNextRoute(to);
    const current = this._current;

    const nextMatches = nextRoute.matches || [];
    const routeRedirect = getRedirectFromRoutes(nextMatches);

    if (routeRedirect) {
      return this._history.replace(routeRedirect, {
        redirectedFrom: routeRedirect
      });
    }

    const queue = ([] as Array<NavigationGuardHook>).concat(
      this._beforeEachs.toArray(),
      extractHooks(nextMatches, 'resolve')
    );

    const abort = () => {
      onAbort && onAbort();

      // fire ready cbs once
      if (!this._ready) {
        this._ready = true;
        this._readyDefer.resolve();
      }
    };
    this._pending = to;
    const iterator = (hook: NavigationGuardHook, next: Function) => {
      if (this._pending !== to) {
        return abort();
      }

      try {
        hook(nextRoute, current, to => {
          if (to === false) {
            abort();
          } else if (isError(to)) {
            abort();
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' && typeof to.path === 'string')
          ) {
            abort();
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
        abort();
        console.error('Uncaught error during navigation:', err);
      }
    };

    runQueue(queue, iterator, () => {
      if (this._pending !== to) {
        return abort();
      }
      this._pending = null;

      onComplete();
      const pre = this._current;
      this._current = this._getCurrent();
      this._afterEachs.call(this._current, pre);

      // fire ready cbs once
      if (!this._ready) {
        this._ready = true;
        this._readyDefer.resolve();
      } else {
        console.log('to', to);
        this._listeners.call({
          action: this._history.action,
          location: this._history.location
        });
      }
    });
  }

  private _getCurrent(): IRoute<RouteRecord> {
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
      state: location.state,
      redirected: !!location.redirectedFrom
    };
  }

  private _getNextRoute(to: PathRecord): IRoute<RouteRecord> {
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
