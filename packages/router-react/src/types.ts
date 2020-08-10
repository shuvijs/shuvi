import {
  INavigator,
  IParams,
  Action,
  InitialEntry,
  Location,
  State,
  To,
  IRouteObject as RouteObject,
  IRouter,
  History
} from '@shuvi/router';

export interface ILocationContextObject {
  action?: Action;
  location?: Location;
  navigator?: INavigator;
  static: boolean;
  router?: IRouter;
}

export interface IRouteContextObject {
  outlet: React.ReactElement | null;
  params: IParams;
  pathname: string;
  route: IRouteObject | null;
}

export interface IMemoryRouterProps {
  children?: React.ReactNode;
  initialEntries?: InitialEntry[];
  initialIndex?: number;
}

export interface INavigateProps {
  to: To;
  replace?: boolean;
  state?: State;
}

export interface IOutletProps {}

export interface IRouteProps {
  caseSensitive?: boolean;
  children?: React.ReactNode;
  element?: React.ReactElement | null;
  path?: string;
}

export interface IRouterProps {
  history: History;
  children?: React.ReactNode;
  static?: boolean;
  router?: IRouter;
}

export interface IRoutesProps {
  basename?: string;
  children?: React.ReactNode;
}

/**
 * The interface for the navigate() function returned from useNavigate().
 */
export interface INavigateFunction {
  (to: To, options?: { replace?: boolean; state?: State }): void;
  (delta: number): void;
}

export type IRouteObject = RouteObject<React.ReactNode>;

/**
 * A "partial route" object is usually supplied by the user and may omit
 * certain properties of a real route object such as `path` and `element`,
 * which have reasonable defaults.
 */
export interface IPartialRouteObject {
  caseSensitive?: boolean;
  children?: IPartialRouteObject[];
  element?: React.ReactNode;
  path?: string;
}
