import {
  History,
  Path,
  State,
  Listener,
  RemoveListenerCallback,
  PathRecord
} from './history';

export type IParams = Record<string, string[] | string>;

export type IRouteComponentProps = Record<string, string>;

export type IRouteRecord<Element = any, ExtendedTypes = {}> = {
  caseSensitive?: boolean;
  children?: IRouteRecord<Element, ExtendedTypes>[];
  component?: Element; // For react will be React.Element
  redirect?: string;
  props?: IRouteComponentProps;
  path: string;
  filepath?: string;
} & ExtendedTypes;

export type NavigationGuardNextCallback = () => any;

export interface NavigationGuardNext {
  (): void;
  (error: Error): void;
  (location: string | { path?: string; replace?: boolean }): void;
  (valid: boolean | undefined): void;
  (cb: NavigationGuardNextCallback): void;
}

export interface NavigationGuardHook<R extends IRouteRecord = any> {
  (to: IRoute<R>, from: IRoute<R>, next: NavigationGuardNext): void;
}

export interface NavigationGuardHookWithContext<R extends IRouteRecord = any> {
  (
    to: IRoute<R>,
    from: IRoute<R>,
    next: NavigationGuardNext,
    context: NavigationHookContext
  ): void;
}

export interface NavigationResolvedHook<R extends IRouteRecord = any> {
  (to: IRoute<R>, from: IRoute<R>): void;
}

export interface NavigationHookContext {
  props?: Record<string, string>;
}

export interface IRouteMatch<T = IRouteRecord> {
  route: T;
  pathname: string;
  params: IParams;
}

export type IRouteBranch<T = IRouteRecord> = [string, T[], number[]];

export type IPathPattern =
  | string
  | { path: string; caseSensitive?: boolean; end?: boolean };

export interface IPathMatch {
  path: string;
  pathname: string;
  params: IParams;
}

export type IPartialRouteRecord<Element = any> = Partial<IRouteRecord<Element>>;

export interface IRoute<RouteRecord extends IRouteRecord = IRouteRecord>
  extends Path {
  params: IParams;
  state: State;
  matches: IRouteMatch<RouteRecord>[];
  redirected?: boolean;
  key: string;
  // todo?
  // fullpath: string?
  // href: string?
}

export interface IRouter<
  RouteRecord extends {
    path: string;
  } = any
> {
  current: IRoute<RouteRecord>;
  action: History['action'];
  push(to: PathRecord, state?: any): void;
  replace(to: PathRecord, state?: any): void;
  go: History['go'];
  back: History['back'];
  block: History['block'];
  resolve: History['resolve'];
  forward(): void;
  ready: Promise<any>;
  routes: RouteRecord[];
  match(to: PathRecord): Array<IRouteMatch<RouteRecord>>;

  init: () => IRouter<RouteRecord>;

  listen: (listener: Listener) => RemoveListenerCallback;
  beforeEach: (listener: NavigationGuardHook) => RemoveListenerCallback;
  beforeResolve: (listener: NavigationGuardHook) => RemoveListenerCallback;
  afterEach: (listener: NavigationResolvedHook) => RemoveListenerCallback;

  replaceRoutes: (routes: RouteRecord[]) => void;
}
