import {
  IApplication,
  IRequest,
  IHtmlAttrs,
  IHtmlTag,
  IClientRendererOptions,
  IServerRendererOptions,
  IViewClient,
  IViewServer,
  IRenderAppServerResult
} from '@shuvi/platform-shared/shared';
import { IServerPluginContext } from '@shuvi/service';

export { IHtmlAttrs, IHtmlTag, IApplication };

export interface IRendererConstructorOptions {
  serverPluginContext: IServerPluginContext;
}

export type IRenderDocumentOptions = {
  app: IApplication;
  req: IRequest;
};

export interface IHtmlDocument {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

export interface IRenderOptions extends IRenderDocumentOptions {}

export {
  IRenderAppServerResult,
  IClientRendererOptions,
  IServerRendererOptions,
  IViewClient,
  IViewServer
};
