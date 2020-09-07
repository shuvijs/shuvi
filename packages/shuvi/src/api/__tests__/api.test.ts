import { getApi } from '../api';
import { PluginApi } from '../pluginApi';
import { IApiConfig, IPaths } from '@shuvi/types';
import path from 'path';
import { resolvePreset } from './utils';

describe('api', () => {
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

    test('should access config and paths', async () => {
      let config: IApiConfig;
      let paths: IPaths;

      await getApi({
        config: {
          rootDir: path.join(__dirname, 'fixtures', 'dotenv'),
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
      expect(paths!.rootDir).toBe(path.join(__dirname, 'fixtures', 'dotenv'));
    });
  });

  describe('presets', () => {
    test('should work', async () => {
      const api = await getApi({
        config: { presets: [resolvePreset('a-b-preset')] }
      });
      const plugins = (api as any)._presetPlugins;
      expect(plugins.length).toBe(2);
      expect(plugins[0].id).toMatch(/plugin-a/);
      expect(plugins[1].id).toMatch(/plugin-b/);
    });

    test('should work with nested preset', async () => {
      const api = await getApi({
        config: { presets: [resolvePreset('nest-preset-preset')] }
      });
      const plugins = (api as any)._presetPlugins;
      expect(plugins.length).toBe(3);
      expect(plugins[0].id).toMatch(/plugin-a/);
      expect(plugins[1].id).toMatch(/plugin-b/);
      expect(plugins[2].id).toMatch(/plugin-c/);
    });
  });

  test('getPluginApi', async () => {
    let pluginApi!: PluginApi;
    const api = await getApi({
      config: { plugins: [api => (pluginApi = api)] }
    });

    expect(pluginApi.mode).toBe(api.mode);
    expect(pluginApi.paths).toBe(api.paths);
    expect(pluginApi.config).toBe(api.config);

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
      cwd: path.join(__dirname, 'fixtures', 'dotenv')
    });

    expect(process.env.READ_ENV).toBe('true');
  });
});
