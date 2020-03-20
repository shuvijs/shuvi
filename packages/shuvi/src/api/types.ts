import { IRoute } from "@shuvi/core";
import { Bundler, IApi, Runtime } from "@shuvi/types";

import IDocumentProps = Runtime.IDocumentProps;
import ITemplateData = Runtime.ITemplateData;

export interface IAppModule {
  App: any;
}

export interface IDocumentModule {
  onDocumentProps(
    documentProps: IDocumentProps
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(): Promise<ITemplateData> | ITemplateData;
}

export type IBuiltResource = {
  server: {
    app: IAppModule;
    routes: IRoute[];
    document: Partial<IDocumentModule>;
    renderer: Runtime.IRenderer;
  };
  documentTemplate: any;
  clientManifest: Bundler.IManifest;
  serverManifest: Bundler.IManifest;
};

export type IResources<Extra = {}> = IBuiltResource & {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

type PluginFn = (api: IApi) => void;

export interface IPlugin {
  id: string;
  get: () => PluginFn;
}
