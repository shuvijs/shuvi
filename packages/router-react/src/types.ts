import {
  IParams,
  InitialEntry,
  State,
  PathRecord,
  IRouteRecord as IOriginRouteRecord,
  IPartialRouteRecord as IOriginalRouteRecord,
  IRouter,
  IPageError
} from '@shuvi/router';

export type IRouteRecord = IOriginRouteRecord<React.ReactNode>;

export type IPartialRouteRecord = IOriginalRouteRecord;

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
  to: PathRecord;
  replace?: boolean;
  state?: State;
}

export interface IOutletProps {}

export interface IRouterProps {
  children?: React.ReactNode;
  static?: boolean;
  router: IRouter;
  error?: IPageError;
  ErrorComp?: React.ComponentType<IPageError>;
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
