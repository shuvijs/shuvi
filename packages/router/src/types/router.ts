import { History, Path, State, Listener } from './history';

export type IParams = Record<string, string>;

export interface IRouteRecord<Element = any> {
  caseSensitive?: boolean;
  children?: IRouteRecord<Element>[];
  element?: Element; // For react will be React.Element
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

export type IPartialRouteRecord<Element = any> = {
  caseSensitive?: boolean;
  children?: IPartialRouteRecord<Element>[];
  element?: Element; // For react will be React.Element
  path?: string;
};

export interface IRoute extends Path {
  params: IParams;
  state: State;
  matches: IRouteMatch[] | null;

  // todo?
  // fullpath: string?
  // href: string?
}

export interface IRouter {
  current: IRoute;
  action: History['action'];
  push: History['push'];
  replace: History['replace'];
  go: History['go'];
  back: History['back'];
  block: History['block'];
  resolve: History['resolve'];
  forward(): void;
  onChange: (listener: Listener) => void;
}
