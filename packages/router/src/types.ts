import { History } from 'history';

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

export type IRouteBranch = [string, IRouteObject[], number[]];

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

/**
 * A Navigator is a "location changer"; it's how you get to different locations.
 *
 * Every history instance conforms to the Navigator interface, but the
 * distinction is useful primarily when it comes to the low-level <Router> API
 * where both the location and a navigator must be provided separately in order
 * to avoid "tearing" that may occur in a suspense-enabled app if the action
 * and/or location were to be read directly from the history instance.
 */
export type INavigator = Omit<
  History,
  'action' | 'location' | 'back' | 'forward' | 'listen'
>;
