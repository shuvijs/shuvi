import {
  History,
  IRouter,
  IRoute,
  IRouteRecord,
  IPartialRouteRecord,
  ResolvedPath,
  To
} from './types';
import { matchRoutes } from './matchRoutes';
import { createRoutesFromArray } from './createRoutesFromArray';
import { normalizeBase, joinPaths } from './utils';

interface IRouterOptions {
  history: History;
  routes: IPartialRouteRecord[];
  caseSensitive?: boolean;
  basename?: string;
}

class Router implements IRouter {
  private _basename: string;
  private _history: History;
  private _routes: IRouteRecord[];
  private _current: IRoute;

  constructor({ basename = '', history, routes }: IRouterOptions) {
    this._basename = normalizeBase(basename);
    this._history = history;
    this._routes = createRoutesFromArray(routes);
    this._current = this._getCurrent();
    this._history.listen(() => (this._current = this._getCurrent()));
  }

  get current(): IRoute {
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
}

export const createRouter = (options: IRouterOptions): IRouter => {
  return new Router(options);
};
