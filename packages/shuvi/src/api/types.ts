import { Bundler, IApi, Runtime, IApiConfig } from '@shuvi/types';

export type IBuiltResource = {
  server: {
    server: Runtime.IServerModule;
    application: Runtime.IApplicationModule;
    document: Partial<Runtime.IDocumentModule>;
    view: Runtime.IViewServer;
    matchRoutes(
      routes: Runtime.IUserRouteConfig[],
      pathname: string
    ): Runtime.IMatchedRoute<Runtime.IUserRouteConfig>[];
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

export interface IPresetSpec {
  (api: IApi): {
    presets?: IApiConfig['presets'];
    plugins?: IApiConfig['plugins'];
  };
}

export interface IPlugin {
  id: string;
  get: () => IPluginSpec;
}

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
}

export interface IMiddleware {
  id: string;
  path: string;
  handler: string;
  get: () => Runtime.IServerAppMiddleware | Runtime.IServerAppHandler;
}
