import { IAppState } from '@shuvi/platform-shared/esm/runtime';

export type IReactAppData = {
  appProps?: Record<string, any>;
  errorProps?: {
    notFound: boolean;
  };
  dynamicIds?: Array<string | number>;
  appState?: IAppState;
};

export type IRouteProps = {
  [x: string]: any;
};
