import { Response } from '@shuvi/platform-shared/shared';
import { ShuviRequest, IServerPluginContext } from '@shuvi/service';
import {
  IHtmlAttrs,
  IHtmlTag,
  IClientRendererOptions,
  IServerRendererOptions,
  IViewClient,
  IViewServer,
  IRenderAppServerResult,
  Application
} from '../../../../../shared';

export { IHtmlAttrs, IHtmlTag, Application };

export interface IRendererConstructorOptions {
  serverPluginContext: IServerPluginContext;
}

export type IRenderViewOptions = {
  app: Application;
  req: ShuviRequest;
  ssr: boolean;
};

export type IRenderDocumentResult =
  | Promise<IHtmlDocument | Response>
  | IHtmlDocument
  | Response;

export interface IHtmlDocument {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

export interface IRenderOptions extends IRenderViewOptions {}

export {
  IRenderAppServerResult,
  IClientRendererOptions,
  IServerRendererOptions,
  IViewClient,
  IViewServer
};
