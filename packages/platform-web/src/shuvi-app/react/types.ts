import {
  IAppState,
  IViewClient,
  IViewServer
} from '@shuvi/platform-shared/esm/shared';

export type IReactAppData = {
  appProps?: Record<string, any>;
  errorProps?: {
    notFound: boolean;
  };
  dynamicIds?: Array<string | number>;
  appState?: IAppState;
  loadersData: any;
};

export type IReactServerView = IViewServer<IReactAppData>;

export type IReactClientView = IViewClient<IReactAppData>;
