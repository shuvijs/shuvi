import {
  IParams,
  InitialEntry,
  State,
  To,
  IRouteRecord as IOriginRouteRecord,
  IRouter
} from '@shuvi/router';

export type IRouteRecord = IOriginRouteRecord<React.ReactNode>;

export interface IRouterContextObject {
  static: boolean;
  router: IRouter;
}

export interface IRouteContextObject {
  depth: number;
  params: IParams;
  pathname: string;
  route: IRouteRecord | null;
}

export interface IMemoryRouterProps {
  basename?: string;
  children?: React.ReactNode;
  routes?: IRouteRecord[];
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
  children?: React.ReactNode;
  static?: boolean;
  router: IRouter;
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

/**
 * A "partial route" object is usually supplied by the user and may omit
 * certain properties of a real route object such as `path` and `element`,
 * which have reasonable defaults.
 */
export interface IPartialRouteRecord {
  caseSensitive?: boolean;
  children?: IPartialRouteRecord[];
  element?: React.ReactNode;
  path?: string;
}
