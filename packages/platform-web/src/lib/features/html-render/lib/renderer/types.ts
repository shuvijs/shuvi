import { IRedirectState, IRouter } from '@shuvi/router';
import {
  IApplication,
  IModelManager
} from '@shuvi/platform-shared/lib/runtime';
import { IServerPluginContext } from '@shuvi/service';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-shared/lib/runtime';

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
}

export interface IRendererConstructorOptions {
  serverPluginContext: IServerPluginContext;
}

export type IRenderDocumentOptions = {
  app: IApplication;
  AppComponent: any;
  router?: IRouter;
  modelManager: IModelManager;
  appContext: any;
};

export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

export interface ITemplateData {
  [x: string]: any;
}
