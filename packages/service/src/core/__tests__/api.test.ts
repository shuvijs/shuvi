import { getApi } from '../api';
import { UserConfig, IPaths } from '..';
import path from 'path';
import rimraf from 'rimraf';
import { resolvePlugin } from './utils';
import { readFileSync } from 'fs';

test('should has "production" be default mode', async () => {
  const prodApi = await getApi({
    config: {}
  });
  expect(prodApi.mode).toBe('production');
});

describe('plugins', () => {
  test('should work', async () => {
    let context: any;
    await getApi({
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
    expect(context!.paths).toBeDefined();
  });

  test('should access config and paths', async () => {
    let config: UserConfig;
    let paths: IPaths;

    const api = await getApi({
      cwd: path.join(__dirname, 'fixtures', 'dotenv'),
      config: {
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
    expect(api.cwd).toBe(path.join(__dirname, 'fixtures', 'dotenv'));
  });

  describe('modifyConfig', () => {
    test('should work', async () => {
      let context: any;
      await getApi({
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
      expect(context.config.publicPath).toBe('/bar');
      expect((context.config as any)._phase).toBe('PHASE_PRODUCTION_SERVER');
    });
  });
});

test('add App files, add App services', async () => {
  const shuviDir = path.join(__dirname, 'fixtures', 'rootDir', '.shuvi');
  rimraf.sync(shuviDir);
  function resolveBuildFile(...paths: string[]) {
    return path.join(shuviDir, ...paths);
  }
  type TestRule = [string, string | RegExp];
  function checkMatch(tests: TestRule[]) {
    tests.forEach(([file, expected]) => {
      if (typeof expected === 'string') {
        expect(readFileSync(resolveBuildFile(file), 'utf8')).toBe(expected);
      } else {
        expect(readFileSync(resolveBuildFile(file), 'utf8')).toMatch(expected);
      }
    });
  }
  const api = await getApi({
    cwd: path.join(__dirname, 'fixtures', 'rootDir'),
    config: {
      plugins: [
        {
          appRuntimeFile: () => [
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
          runtimeService: () => ({
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
    ['app/files/fileA.js', 'test.js'],
    ['app/files/fileC.js', 'test.js'],
    ['app/files/fileC.js', 'test.js'],
    ['runtime/a.js', 'export exported from "source"']
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
