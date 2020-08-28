import {
  History,
  Path,
  State,
  Listener,
  NavigationGuardHook,
  NavigationResolvedHook,
  RemoveListenerCallback
} from './history';

export type IParams = Record<string, string>;

export interface IRouteRecord<Element = any> {
  caseSensitive?: boolean;
  children?: IRouteRecord<Element>[];
  element?: Element; // For react will be React.Element
  redirect?: string;
  onBeforeEnter?: NavigationGuardHook;
  path: string;
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

export interface IRoute<RouteRecord extends IRouteRecord> extends Path {
  params: IParams;
  state: State;
  matches: IRouteMatch<RouteRecord>[] | null;

  // todo?
  // fullpath: string?
  // href: string?
}

export interface IRouter<RouteRecord extends IRouteRecord = IRouteRecord> {
  current: IRoute<RouteRecord>;
  action: History['action'];
  push: History['push'];
  replace: History['replace'];
  go: History['go'];
  back: History['back'];
  block: History['block'];
  resolve: History['resolve'];
  forward(): void;

  onChange: (listener: Listener) => RemoveListenerCallback;
  beforeEach: (listener: NavigationGuardHook) => RemoveListenerCallback;
  afterEach: (listener: NavigationResolvedHook) => RemoveListenerCallback;
  beforeResolve: (listener: NavigationGuardHook) => RemoveListenerCallback;
}
