import { IApi } from '@shuvi/types';
import { Api } from '../api';

const apiProps: Array<keyof IApi> = [
  'mode',
  'phase',
  'paths',
  'config',
  'helpers',
  'clientManifest',
  'tap',
  'callHook',
  'on',
  'emitEvent',
  'addEntryCode',
  'addAppFile',
  'addAppExport',
  'addAppService',
  'addAppPolyfill',
  'addRuntimePlugin',
  'setPlatformModule',
  'setRuntimeCoreModule',
  'resolveAppFile',
  'resolveUserFile',
  'resolveBuildFile',
  'resolvePublicFile',
  'getAssetPublicUrl'
];

class PluginApi implements IApi {
  // props
  mode: any;
  paths: any;
  config: any;
  phase: any;
  // helpers
  helpers: any;
  // resources
  clientManifest: any;

  // methods
  tap: any;
  callHook: any;
  on: any;
  emitEvent: any;

  addEntryCode: any;
  addAppFile: any;
  addAppExport: any;
  addAppService: any;
  addAppPolyfill: any;
  addRuntimePlugin: any;

  setPlatformModule: any;
  setRuntimeCoreModule: any;

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
    }
  });
}
