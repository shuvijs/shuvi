import {
  IAppState,
  IAppComponent as PlatformAppComponent,
  IRouteComponent as PlatformRouteComponent,
  IViewClient,
  IViewServer
} from '@shuvi/runtime-core';

export type IReactAppData = {
  appProps?: Record<string, any>;
  errorProps?: {
    notFound: boolean;
  };
  dynamicIds?: Array<string | number>;
  appState?: IAppState;
  routeProps: IRouteProps;
};

export interface IAppContainerProps {
  routeProps: IRouteProps;
}

export type IRouteProps = {
  [x: string]: any;
};

export type IAppComponent = PlatformAppComponent<React.Component, any>;

export type IRouteComponent = PlatformRouteComponent<React.Component, any>;

export type IReactServerView = IViewServer<React.ComponentType, IReactAppData>;
export type IReactClientView = IViewClient<React.ComponentType, IReactAppData>;
