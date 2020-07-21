import { Runtime } from '@shuvi/types';
import { IViewClient, IViewServer } from '@shuvi/types/src/runtime';

export type IReactAppData = {
  appProps?: Record<string, any>;
  errorProps?: {
    notFound: boolean;
  };
  dynamicIds?: Array<string | number>;
  routeProps: IRouteProps;
};

export interface IAppContainerProps {
  routeProps: IRouteProps;
}

export type IRoute = Runtime.IRoute;

export type IRouteProps = {
  [x: string]: any;
};

export type IAppComponent = Runtime.IAppComponent<React.Component, any>;

export type IRouteComponent = Runtime.IRouteComponent<React.Component, any>;

export type IReactServerView = IViewServer<React.ComponentType, IReactAppData>;
export type IReactClientView = IViewClient<React.ComponentType, IReactAppData>;
