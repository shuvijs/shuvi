import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import {
  Response,
  IApplication,
  IRequest,
  IAppData
} from '@shuvi/platform-shared/shared';

export type IRenderDocumentOptions = {
  app: IApplication;
  req?: IRequest;
};

export interface IRenderOptions extends IRenderDocumentOptions {}

export interface IView<
  RenderOption extends IRenderOptions = any,
  RenderResult = void
> {
  renderApp(options: RenderOption): RenderResult;
}

export type IHtmlAttrs = { textContent?: string } & {
  [x: string]: string | number | undefined | boolean;
};

export interface IHtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs: IHtmlAttrs;
  innerHTML?: string;
}

export type IRenderAppServerResult<ExtraAppData = {}> = {
  htmlAttrs?: IHtmlAttrs;
  headBeginTags?: IHtmlTag[];
  headEndTags?: IHtmlTag[];
  mainBeginTags?: IHtmlTag[];
  mainEndTags?: IHtmlTag[];
  scriptBeginTags?: IHtmlTag[];
  scriptEndTags?: IHtmlTag[];
  appData?: ExtraAppData;
  content?: string;
};

export interface IClientRendererOptions<ExtraAppData = {}>
  extends IRenderOptions {
  appContainer: HTMLElement;
  appData: IAppData<ExtraAppData>;
}

export interface IServerRendererOptions extends IRenderOptions {
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

export interface IViewClient<ExtraAppData = {}>
  extends IView<IClientRendererOptions<ExtraAppData>> {}

export interface IViewServer<ExtraAppData = {}>
  extends IView<
    IServerRendererOptions,
    Promise<IRenderAppServerResult<ExtraAppData> | Response>
  > {}
