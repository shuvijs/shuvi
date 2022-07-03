import {
  IApplication,
  IRequest,
  IHtmlAttrs,
  IHtmlTag,
  IClientRendererOptions,
  IServerRendererOptions,
  IViewClient,
  IViewServer,
  IRenderAppResult,
  IRedirectState
} from '@shuvi/platform-shared/lib/runtime';
import { IServerPluginContext } from '@shuvi/service';

export { IHtmlAttrs, IHtmlTag, IApplication };

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
}

export interface IRendererConstructorOptions {
  serverPluginContext: IServerPluginContext;
}

export type IRenderDocumentOptions = {
  app: IApplication;
  req: IRequest;
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

export interface IRenderOptions extends IRenderDocumentOptions {}

export {
  IRenderAppResult,
  IClientRendererOptions,
  IServerRendererOptions,
  IViewClient,
  IViewServer
};
