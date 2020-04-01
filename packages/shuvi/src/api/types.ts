import { IRoute } from "@shuvi/core";
import { Bundler, IApi, Runtime } from "@shuvi/types";

export type IBuiltResource = {
  server: {
    app: Runtime.IAppModule;
    routes: IRoute[];
    document: Partial<Runtime.IDocumentModule>;
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
