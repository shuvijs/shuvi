import { Bundler, IApi, Runtime, IApiConfig } from '@shuvi/types';

export type IBuiltResource = {
  server: {
    server: Runtime.IServerModule;
    application: Runtime.IApplicationModule;
    document: Partial<Runtime.IDocumentModule>;
    renderer: Runtime.IServerRenderer;
    matchRoutes(
      routes: Runtime.IRouteConfig[],
      pathname: string
    ): Runtime.IMatchedRoute[];
  };
  documentTemplate: any;
  clientManifest: Bundler.IManifest;
  serverManifest: Bundler.IManifest;
};

export type IResources<Extra = {}> = IBuiltResource & {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

export interface IPluginSpec {
  modifyConfig?(config: IApiConfig): Promise<IApiConfig>;
  apply(api: IApi): void;
}

export interface IPlugin {
  id: string;
  get: () => IPluginSpec;
}
