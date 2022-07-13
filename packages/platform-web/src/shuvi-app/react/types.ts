import { IAppState } from '@shuvi/platform-shared/shared';
import { IHtmlTag, IViewClient, IViewServer } from '../../shared';

export { IHtmlTag };

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
