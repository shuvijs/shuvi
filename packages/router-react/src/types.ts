import {
  IParams,
  InitialEntry,
  State,
  PathRecord,
  IRouteRecord as IOriginRouteRecord,
  IPartialRouteRecord as IOriginalRouteRecord,
  IRouter
} from '@shuvi/router';

export type IRouteRecord<T = {}> = IOriginRouteRecord<React.ReactNode, T>;

export type IPartialRouteRecord = IOriginalRouteRecord;

export interface IRouterContextObject {
  static: boolean;
  router: IRouter;
}

export interface IRouteContextObject<ExtendedTypes = {}> {
  depth: number;
  params: IParams;
  pathname: string;
  route: IRouteRecord<ExtendedTypes> | null;
}

export interface IMemoryRouterProps {
  basename?: string;
  children?: React.ReactNode;
  routes?: IRouteRecord[];
  initialEntries?: InitialEntry[];
  initialIndex?: number;
}

export interface INavigateProps {
  to: PathRecord;
  replace?: boolean;
  state?: State;
}

export interface IOutletProps {}

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
  (to: PathRecord, options?: { replace?: boolean; state?: State }): void;
  (delta: number): void;
}
