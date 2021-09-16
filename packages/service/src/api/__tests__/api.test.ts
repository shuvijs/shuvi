import { getApi, IApiConfig, IPaths, PluginApi } from '..';
import path from 'path';
import rimraf from 'rimraf';
import { resolvePreset, resolvePlugin } from './utils';
import { readFileSync } from 'fs';
import getPlatform from '../../lib/getPlatform';
import { getConfig, getConfigByRootDir } from '../../config';

jest.mock('../initCoreResource', () => ({
  initCoreResource: (api: any) => {
    api.addResoure('clientManifest', () => ({ entries: [] }));
  }
}));

describe('api', () => {
  test('should has "production" be default mode', async () => {
    const config = getConfig({});
    const platform = getPlatform(config.platform.name);
    const prodApi = await getApi({
      config,
      platform
    });
    expect(prodApi.mode).toBe('production');
  });

  describe('plugins', () => {
    test('should work', async () => {
      let pluginApi: PluginApi;
      const config = getConfig({ plugins: [api => (pluginApi = api)] });
      const platform = getPlatform(config.platform.name);
      const api = await getApi({
        config,
        platform
      });

      expect(pluginApi!).toBeDefined();
      expect(pluginApi!.paths).toBe(api.paths);
    });

    test('should access config and paths', async () => {
      let config: IApiConfig;
      let paths: IPaths;
      config = getConfig({
        rootDir: path.join(__dirname, 'fixtures', 'dotenv'),
        publicPath: '/test',
        plugins: [
          api => {
            config = api.config;
            paths = api.paths;
          }
        ]
      });
      const platform = getPlatform(config.platform.name);
      await getApi({
        config,
        platform
      });
      expect(config!.publicPath).toBe('/test');
      expect(paths!.rootDir).toBe(path.join(__dirname, 'fixtures', 'dotenv'));
    });

    describe('modifyConfig', () => {
      test('should work', async () => {
        let pluginApi: PluginApi;
        const config = getConfig({
          plugins: [resolvePlugin('modify-config'), api => (pluginApi = api)]
        });
        const platform = getPlatform(config.platform.name);
        const api = await getApi({
          config,
          platform
        });
        const plugins = (pluginApi! as any).__plugins;
        expect(plugins.length).toBe(1);
        expect(plugins[0].name).toBe('modify-config');
        expect(api.config.publicPath).toBe('/bar');
        expect((api.config as any)._phase).toBe('PHASE_PRODUCTION_SERVER');
      });
    });
  });

  describe('presets', () => {
    test('should work', async () => {
      const config = getConfig({ presets: [resolvePreset('a-b-preset')] });
      const platform = getPlatform(config.platform.name);
      const api = await getApi({
        config,
        platform
      });
      const plugins = (api as any)._presetPlugins;
      expect(plugins.length).toBe(2);
      expect(plugins[0].id).toMatch(/plugin-a/);
      expect(plugins[1].id).toMatch(/plugin-b/);
    });

    test('should work with nested preset', async () => {
      const config = getConfig({
        presets: [resolvePreset('nest-preset-preset')]
      });
      const platform = getPlatform(config.platform.name);
      const api = await getApi({
        config,
        platform
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
    const config = getConfig({ plugins: [api => (pluginApi = api)] });
    const platform = getPlatform(config.platform.name);
    const api = await getApi({
      config,
      platform
    });

    expect(pluginApi.mode).toBe(api.mode);
    expect(pluginApi.paths).toBe(api.paths);
    expect(pluginApi.config).toBe(api.config);
    expect(pluginApi.phase).toBe(api.phase);
    expect(pluginApi.clientManifest).toBe(api.clientManifest);

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

  test('add App files, add App services', async () => {
    const shuviDir = path.join(__dirname, 'fixtures', 'rootDir', '.shuvi');
    const shuviAppDir = path.join(shuviDir, 'app');
    rimraf.sync(shuviDir);
    function resolveBuildFile(...paths: string[]) {
      return path.join(shuviAppDir, ...paths);
    }
    type TestRule = [string, string | RegExp];
    function checkMatch(tests: TestRule[]) {
      tests.forEach(([file, expected]) => {
        if (typeof expected === 'string') {
          expect(readFileSync(resolveBuildFile(file), 'utf8')).toBe(expected);
        } else {
          expect(readFileSync(resolveBuildFile(file), 'utf8')).toMatch(
            expected
          );
        }
      });
    }
    const config = getConfig({
      rootDir: path.join(__dirname, 'fixtures', 'rootDir'),
      plugins: [
        api => {
          api.addAppFile({
            name: 'fileA.js',
            content: () => 'test.js'
          });
          api.addAppFile({
            name: '../fileB.js',
            content: () => 'test.js'
          });
          api.addAppFile({
            name: '/fileC.js',
            content: () => 'test.js'
          });
          api.addAppService('source', 'exported', 'a.js');
        }
      ]
    });
    const platform = getPlatform(config.platform.name);
    const api = await getApi({
      config,
      platform
    });
    await api.buildApp();
    checkMatch([
      ['files/fileA.js', 'test.js'],
      ['files/fileC.js', 'test.js'],
      ['files/fileC.js', 'test.js'],
      ['services/a.js', 'export exported from "source"']
    ]);
    await api.destory();
    rimraf.sync(shuviDir);
  });

  test('should load dotEnv when init', async () => {
    expect(process.env.READ_ENV).toBeUndefined();
    const config = getConfigByRootDir({
      rootDir: path.join(__dirname, 'fixtures', 'dotenv')
    });
    const platform = getPlatform(config.platform.name);
    await getApi({
      config,
      platform
    });
    expect(process.env.READ_ENV).toBe('true');
  });
});
