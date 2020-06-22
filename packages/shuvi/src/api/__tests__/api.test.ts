import { getApi, Api } from '../api';
import { PluginApi } from '../pluginApi';
import { resolvePlugin } from './utils';
import { IApiConfig, IPaths } from '@shuvi/types';
import path from 'path';
import { CONFIG_FILE } from '@shuvi/shared/lib/constants';

describe('api', () => {
  let gApi: Api;
  beforeAll(async () => {
    gApi = await getApi({
      mode: 'development',
      config: {}
    });
  });

  test('should has "production" be default mode', async () => {
    const prodApi = await getApi({ config: {} });
    expect(prodApi.mode).toBe('production');
  });

  describe('plugins', () => {
    test('should work', async () => {
      let pluginApi: PluginApi;
      const api = await getApi({
        config: { plugins: [api => (pluginApi = api)] }
      });
      expect(pluginApi!).toBeDefined();
      expect(pluginApi!.paths).toBe(api.paths);
    });

    test('should modify config', async () => {
      let pluginApi: PluginApi;
      const api = await getApi({
        config: {
          plugins: [resolvePlugin('modify-config'), api => (pluginApi = api)]
        }
      });
      const plugins = (pluginApi! as any).__plugins;
      expect(plugins.length).toBe(1);
      expect(plugins[0].name).toBe('modify-config');
      expect(api.config.publicPath).toBe('/bar');
    });

    test('should access config and paths', async () => {
      let config: IApiConfig;
      let paths: IPaths;
      await getApi({
        config: {
          rootDir: '/root',
          publicPath: '/test',
          plugins: [
            api => {
              config = api.config;
              paths = api.paths;
            }
          ]
        }
      });
      expect(config!.publicPath).toBe('/test');
      expect(paths!.rootDir).toBe('/root');
    });
  });

  test('getPluginApi', () => {
    const pluginApi = gApi.getPluginApi();

    expect(pluginApi.mode).toBe(gApi.mode);
    expect(pluginApi.paths).toBe(gApi.paths);
    expect(pluginApi.config).toBe(gApi.config);

    [
      'tap',
      'callHook',
      'on',
      'emitEvent',
      'addEntryCode',
      'addAppFile',
      'addAppExport',
      'addAppPolyfill',
      'resolveAppFile',
      'resolveUserFile',
      'resolveBuildFile',
      'resolvePublicFile',
      'getAssetPublicUrl'
    ].forEach(method => {
      // @ts-ignore
      expect(typeof pluginApi[method]).toBe('function');
    });
  });

  test('should load dotEnv when init', async () => {
    expect(process.env.READ_ENV).toBeUndefined();

    await getApi({
      configFile: path.join(__dirname, 'fixtures', 'dotenv', CONFIG_FILE)
    });

    expect(process.env.READ_ENV).toBe('true');
  });
});
