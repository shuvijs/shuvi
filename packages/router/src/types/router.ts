export type IParams = Record<string, string>;

export interface IRouteObject<Element = any> {
  caseSensitive?: boolean;
  children?: IRouteObject<Element>[];
  element?: Element; // For react will be React.Element
  path: string;
}

export interface IRouteMatch<T = IRouteObject> {
  route: T;
  pathname: string;
  params: IParams;
}

export type IRouteBranch<T = IRouteObject> = [string, T[], number[]];

export type IPathPattern =
  | string
  | { path: string; caseSensitive?: boolean; end?: boolean };

export interface IPathMatch {
  path: string;
  pathname: string;
  params: IParams;
}

export type IPartialRouteObject<Element = any> = {
  caseSensitive?: boolean;
  children?: IPartialRouteObject<Element>[];
  element?: Element; // For react will be React.Element
  path?: string;
};
