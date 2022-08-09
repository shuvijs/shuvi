import { IHtmlTag, IViewClient, IViewServer } from '../../shared';

export { IHtmlTag };

export type IReactAppData = {
  dynamicIds?: Array<string | number>;
};

export type IReactServerView = IViewServer<IReactAppData>;

export type IReactClientView = IViewClient<IReactAppData>;
