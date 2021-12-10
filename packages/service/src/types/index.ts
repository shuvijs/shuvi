import { Api, IApiRouteConfig, IUserRouteConfig, ICliContext } from '../api';
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
  context: ICliContext
) => Promise<ICliPluginInstance[]> | ICliPluginInstance[];
