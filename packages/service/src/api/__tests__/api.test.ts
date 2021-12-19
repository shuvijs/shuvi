import { getApi } from '../api';
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
      let context: any;
      const api = await getApi({
        config: {
          plugins: [
            {
              setup: cliContext => {
                context = cliContext;
              }
            }
          ]
        }
      });
      expect(context!).toBeDefined();
      expect(context!.paths).toBe(api.cliContext.paths);
    });

    test('should access config and paths', async () => {
      let config: IApiConfig;
      let paths: IPaths;

      await getApi({
        config: {
          rootDir: path.join(__dirname, 'fixtures', 'dotenv'),
          publicPath: '/test',
          plugins: [
            {
              setup: api => {
                config = api.config;
                paths = api.paths;
              }
            }
          ]
        }
      });
      expect(config!.publicPath).toBe('/test');
      expect(paths!.rootDir).toBe(path.join(__dirname, 'fixtures', 'dotenv'));
    });

    describe('modifyConfig', () => {
      test('should work', async () => {
        let context: any;
        const api = await getApi({
          config: {
            plugins: [
              resolvePlugin('modify-config.ts'),
              {
                setup: cliContext => {
                  context = cliContext;
                }
              }
            ]
          }
        });
        const plugins = (context! as any).__plugins;
        expect(plugins.length).toBe(1);
        expect(plugins[0].name).toBe('modify-config');
        expect(api.cliContext.config.publicPath).toBe('/bar');
        expect((api.cliContext.config as any)._phase).toBe(
          'PHASE_PRODUCTION_SERVER'
        );
      });
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
          {
            appFile: () => [
              {
                name: 'fileA.js',
                content: () => 'test.js'
              },
              {
                name: '../fileB.js',
                content: () => 'test.js'
              },
              {
                name: '/fileC.js',
                content: () => 'test.js'
              }
            ],
            appService: () => ({
              source: 'source',
              exported: 'exported',
              filepath: 'a.js'
            })
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
});
