import { IHtmlTag, IViewClient, IViewServer } from '../../shared';

export { IHtmlTag };

export type IReactAppData = {
  errorProps?: {
    notFound: boolean;
  };
  dynamicIds?: Array<string | number>;
  loadersData: any;
};

export type IReactServerView = IViewServer<IReactAppData>;

export type IReactClientView = IViewClient<IReactAppData>;
