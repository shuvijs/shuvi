import { Runtime } from '@shuvi/types';

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

type IReactView = Runtime.IView<React.ComponentType, IReactAppData>;
export type IReactServerView = IReactView['server'];
export type IReactClientView = IReactView['client'];
