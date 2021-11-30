import { getApi } from '../api';
import { PluginApi } from '../pluginApi';
import { IApiConfig, IPaths } from '..';
import path from 'path';
import rimraf from 'rimraf';
import { resolvePreset, resolvePlugin } from './utils';
import { readFileSync } from 'fs';

describe('api', () => {
  test('should has "production" be default mode', async () => {
    const prodApi = await getApi({
      config: {}
    });
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

    describe('modifyConfig', () => {
      test('should work', async () => {
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
        expect((api.config as any)._phase).toBe('PHASE_PRODUCTION_SERVER');
      });
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
    api.addResoure('clientManifest', () => ({ entries: [] }));

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
      'addServerMiddleware',
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
    const api = await getApi({
      config: {
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
      }
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

    await getApi({
      cwd: path.join(__dirname, 'fixtures', 'dotenv')
    });

    expect(process.env.READ_ENV).toBe('true');
  });

  describe('serverMiddleware', () => {
    test('addServerMiddleware', async () => {
      const api = await getApi({
        config: {}
      });

      const serverMiddleware = jest.fn();
      api.addServerMiddleware(serverMiddleware);

      const firstServerMiddleware = jest.fn();
      api.addServerMiddleware({ handler: firstServerMiddleware, order: 0 });

      const secondServerMiddleware = jest.fn();
      api.addServerMiddleware({ handler: secondServerMiddleware, order: 1 });

      const fakeServerMiddleware = jest.fn();
      api.addServerMiddleware(fakeServerMiddleware);

      expect(api.getBeforePageMiddlewares().length).toBe(4);
    });

    test('addServerMiddlewareLast', async () => {
      const api = await getApi({
        config: {}
      });

      const serverMiddleware = jest.fn();
      api.addServerMiddlewareLast(serverMiddleware);

      const firstServerMiddleware = jest.fn();
      api.addServerMiddlewareLast({ handler: firstServerMiddleware, order: 0 });

      const secondServerMiddleware = jest.fn();
      api.addServerMiddlewareLast({
        handler: secondServerMiddleware,
        order: 1
      });

      const fakeServerMiddleware = jest.fn();
      api.addServerMiddlewareLast(fakeServerMiddleware);
      // default platform web add 2 middlewares
      expect(api.getAfterPageMiddlewares().length).toBe(7);
    });
  });
});
