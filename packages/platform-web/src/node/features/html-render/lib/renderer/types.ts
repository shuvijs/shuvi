import { IApplication, Response } from '@shuvi/platform-shared/shared';
import { ShuviRequest, IServerPluginContext } from '@shuvi/service';
import {
  IHtmlAttrs,
  IHtmlTag,
  IClientRendererOptions,
  IServerRendererOptions,
  IViewClient,
  IViewServer,
  IRenderAppServerResult
} from '../../../../../shared';

export { IHtmlAttrs, IHtmlTag, IApplication };

export interface IRendererConstructorOptions {
  serverPluginContext: IServerPluginContext;
}

export type IRenderViewOptions = {
  app: IApplication;
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
