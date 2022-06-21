import {
  IAppComponent as PlatformAppComponent,
  IRouteComponent as PlatformRouteComponent,
  IViewClient,
  IViewServer
} from '@shuvi/platform-shared/esm/runtime';

export type IReactAppData = {
  dynamicIds?: Array<string | number>;
};

export type IAppComponent = PlatformAppComponent<React.Component>;

export type IRouteComponent = PlatformRouteComponent<React.Component>;

export type IReactServerView = IViewServer<React.ComponentType, IReactAppData>;

export type IReactClientView = IViewClient<React.ComponentType, IReactAppData>;
