import path from 'path';
import { IPluginConfig } from '@shuvi/types';
import { Api } from '../api';

const resolvePlugin = (name: string) => path.join(__dirname, 'fixtures', name);

function configPlugin(...plugins: IPluginConfig[]) {
  return {
    ssr: false,
    env: {},
    rootDir: '/',
    outputPath: 'dist',
    publicPath: '',
    router: {
      history: 'auto',
    },
    plugins: plugins,
  } as const;
}

describe('plugin', () => {
  test('should accept string as a plugin', () => {
    const api = new Api({
      mode: 'development',
      config: configPlugin(resolvePlugin('dumb-plugin')),
    });

    const plugins = (api as any).__plugins;
    expect(plugins.length).toBe(1);
    expect(plugins[0].name).toBe('dumb');
  });

  test('should accept function as a plugin', () => {
    const api = new Api({
      mode: 'development',
      config: configPlugin((api) => ((api as any).__test = true)),
    });

    expect((api as any).__test).toBe(true);
  });

  describe('array plugin', () => {
    test('should accept module and option', () => {
      const api = new Api({
        mode: 'development',
        config: configPlugin([resolvePlugin('dumb-plugin'), { test: 1 }]),
      });
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(1);
      expect(plugins[0].name).toBe('dumb');
      expect(plugins[0].options).toMatchObject({ test: 1 });
    });

    test('should accept module and name', () => {
      const api = new Api({
        mode: 'development',
        config: configPlugin([resolvePlugin('dumb-plugin'), 'one']),
      });
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(1);
      expect(plugins[0].name).toBe('dumb');
      expect(plugins[0].options).toMatchObject({});
    });

    test('should accept module, options and name', () => {
      const api = new Api({
        mode: 'development',
        config: configPlugin(
          [resolvePlugin('dumb-plugin'), { test: 1 }, 'one'],
          [resolvePlugin('dumb-plugin'), { test: 2 }, 'two']
        ),
      });
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(2);
      expect(plugins[0].name).toBe('dumb');
      expect(plugins[0].options).toMatchObject({ test: 1 });
      expect(plugins[1].name).toBe('dumb');
      expect(plugins[1].options).toMatchObject({ test: 2 });
    });
  });
});
