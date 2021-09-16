import { Runtime } from '@shuvi/service';

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

export type IRouteProps = {
  [x: string]: any;
};

export type IAppComponent = Runtime.IAppComponent<React.Component, any>;

export type IRouteComponent = Runtime.IRouteComponent<React.Component, any>;

export type IReactServerView = Runtime.IViewServer<
  React.ComponentType,
  IReactAppData
>;
export type IReactClientView = Runtime.IViewClient<
  React.ComponentType,
  IReactAppData
>;
