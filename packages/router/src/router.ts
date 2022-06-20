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
  Listener,
  NavigationHookContext
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

const START: IRoute<any> = {
  matches: null,
  params: {},
  pathname: '/',
  search: '',
  hash: '',
  key: 'default',
  query: {},
  state: null,
  redirected: false
};

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
  private _cancleHandler: (() => void) | null = null;
  private _ready: boolean = false;
  private _readyDefer: Defer = Defer<void>();

  private _listeners: Events<Listener> = createEvents();
  private _beforeEachs: Events<NavigationGuardHook> = createEvents();
  private _beforeResolves: Events<NavigationGuardHook> = createEvents();
  private _afterEachs: Events<NavigationResolvedHook> = createEvents();

  constructor({ basename = '', history, routes }: IRouterOptions<RouteRecord>) {
    this._basename = normalizeBase(basename);
    this._history = history;
    this._routes = createRoutesFromArray(routes);
    this._current = START;
    this._history.doTransition = this._doTransition.bind(this);
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

  replaceRoutes(routes: RouteRecord[]) {
    if (this._ready) {
      this._ready = false;
      this._readyDefer = Defer<void>();
    } else {
      // do nothing
      // keep _readyDefer as it is, cause user might called router.ready()
    }

    if (this._cancleHandler) {
      // cancel current transition
      this._cancleHandler();
      this._cancleHandler = null;
    }

    this._routes = createRoutesFromArray(routes);
    this._current = START;

    const setup = () => this._history.setup();
    this._history.transitionTo(this._getCurrent(), {
      onTransition: setup,
      onAbort: setup
    });
  }

  init() {
    const setup = () => this._history.setup();
    this._history.transitionTo(this._getCurrent(), {
      onTransition: setup,
      onAbort: setup
    });
    return this;
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

  beforeResolve(listener: NavigationGuardHook) {
    return this._beforeResolves.push(listener);
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

    const routeContext = new Map<RouteRecord, NavigationHookContext>();
    const queue = ([] as Array<NavigationGuardHook>).concat(
      this._beforeEachs.toArray(),
      extractHooks(nextMatches, 'resolve', routeContext),
      this._beforeResolves.toArray()
    );

    let cancel: boolean = false;

    this._cancleHandler = () => {
      cancel = true;
      this._pending = null;
    };

    const abort = () => {
      this._cancleHandler = null;

      onAbort && onAbort();

      // fire ready cbs once
      if (!this._ready) {
        this._ready = true;
        this._readyDefer.resolve();
      }
    };
    this._pending = to;
    const iterator = (hook: NavigationGuardHook, next: Function) => {
      if (cancel) {
        return;
      }

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
      if (cancel) {
        return;
      }

      if (this._pending !== to) {
        return abort();
      }
      this._pending = null;
      this._cancleHandler = null;

      onComplete();

      const pre = this._current;
      this._current = this._getCurrent(routeContext);

      // fire ready cbs once
      if (!this._ready) {
        this._ready = true;
        this._readyDefer.resolve();
      }

      this._afterEachs.call(this._current, pre);
      this._listeners.call({
        action: this._history.action,
        location: this._history.location
      });
    });
  }

  private _getCurrent(
    routeContext?: Map<RouteRecord, NavigationHookContext>
  ): IRoute<RouteRecord> {
    const {
      _routes: routes,
      _basename: basename,
      _history: { location }
    } = this;
    const matches = matchRoutes(routes, location, basename);
    let params;
    if (matches) {
      params = matches[matches.length - 1].params;
      if (routeContext) {
        for (const { route } of matches) {
          const resolvedProps = routeContext.get(route)?.props;
          if (resolvedProps) {
            route.props = {
              ...route.props,
              ...resolvedProps
            };
          }
        }
      }
    } else {
      params = {};
    }

    return {
      matches,
      params,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      query: location.query,
      state: location.state,
      redirected: !!location.redirectedFrom,
      key: location.key
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
      key: '',
      state: null
    };
  }
}

export const createRouter = <RouteRecord extends IRouteRecord>(
  options: IRouterOptions<RouteRecord>
): IRouter<RouteRecord> => {
  return new Router(options);
};
