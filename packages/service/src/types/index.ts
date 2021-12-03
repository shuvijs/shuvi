import { Api, IApiRouteConfig, IUserRouteConfig, IPluginContext } from '../api';
import {
  ICliPluginConstructor,
  ICliPluginInstance,
  createPlugin as createCliPlugin
} from '../api/cliHooks';
export {
  IUserRouteConfig,
  IApiRouteConfig,
  createCliPlugin,
  ICliPluginConstructor
};

export type IRuntime = { install: (api: Api) => void } & ICliPluginConstructor;
export type IPlatform = (
  context: IPluginContext
) => Promise<ICliPluginInstance[]> | ICliPluginInstance[];
