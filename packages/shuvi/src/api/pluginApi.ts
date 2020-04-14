import { IApi } from '@shuvi/types';
import { Api } from '../api';

const apiProps: Array<keyof IApi> = [
  'mode',
  'paths',
  'config',
  'tap',
  'callHook',
  'on',
  'emitEvent',
  'addAppFile',
  'addAppExport',
  'addAppPolyfill',
  'resolveAppFile',
  'resolveUserFile',
  'resolveBuildFile',
  'resolvePublicFile',
  'getAssetPublicUrl',
];

class PluginApi implements IApi {
  // props
  mode: any;
  paths: any;
  config: any;

  // methods
  tap: any;
  callHook: any;
  on: any;
  emitEvent: any;

  addAppFile: any;
  addAppExport: any;
  addAppPolyfill: any;

  resolveAppFile: any;
  resolveUserFile: any;
  resolveBuildFile: any;
  resolvePublicFile: any;

  getAssetPublicUrl: any;
}

export type { PluginApi };

function isApiProp(prop: string): prop is keyof IApi {
  return apiProps.includes(prop as any);
}

export function createPluginApi(api: Api): PluginApi {
  const pluginApi = new PluginApi();

  return new Proxy(pluginApi, {
    get: (target, prop: string) => {
      if (isApiProp(prop)) {
        const val = api[prop];
        return typeof val === 'function' ? val.bind(api) : val;
      }

      // @ts-ignore
      return target[prop];
    },
  });
}
