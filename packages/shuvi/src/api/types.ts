import { Bundler, Runtime, IApiConfig, IPhase } from '@shuvi/types';
import { PluginApi } from './pluginApi';

export type IBuiltResource = {
  server: {
    server: Runtime.IServerModule;
    apiRoutes: Runtime.IApiRouteConfig[];
    application: Runtime.IApplicationModule;
    document: Partial<Runtime.IDocumentModule>;
    view: Runtime.IViewServer;
  };
  documentTemplate: any;
  clientManifest: Bundler.IManifest;
  serverManifest: Bundler.IManifest;
};

export type IResources<Extra = {}> = IBuiltResource & {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

export interface IPluginSpec {
  modifyConfig?(config: IApiConfig, phase: IPhase): Promise<IApiConfig>;
  apply(api: PluginApi): void;
}

export interface IPresetSpec {
  (api: PluginApi): {
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
