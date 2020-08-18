import { Runtime } from '@shuvi/types';
import { IViewClient, IViewServer } from '@shuvi/types/src/runtime';

export type IReactAppData = {
  appProps?: Record<string, any>;
  errorProps?: Record<string, any>;
  routeProps: IRouteProps;
  dynamicIds?: Array<string | number>;
};

export interface IAppContainerProps {
  routeProps: IRouteProps;
}

export type IRoute = Runtime.IRoute;

export type IRouteProps = {
  [x: string]: any;
};

export type IAppComponent = Runtime.IAppComponent<
  React.ComponentType<any>,
  any
>;

export type IRouteComponent = Runtime.IRouteComponent<
  React.ComponentType<any>,
  any
>;

export type IReactServerView = IViewServer<
  React.ComponentType<any>,
  IReactAppData
>;
export type IReactClientView = IViewClient<
  React.ComponentType<any>,
  IReactAppData
>;
