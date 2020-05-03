import path from 'path';
import { IPluginConfig } from '@shuvi/types';
import { resolvePlugins } from '../plugin';

function callPlugins(context: any, ...plugins: IPluginConfig[]) {
  resolvePlugins(plugins, {
    dir: path.join(__dirname, 'fixtures/plugins')
  }).forEach(p => p.get()(context));
}

describe('plugin', () => {
  test('should accept class module as a plugin', () => {
    const api = {};
    callPlugins(api, './dumb-plugin');
    const plugins = (api as any).__plugins;
    expect(plugins.length).toBe(1);
    expect(plugins[0].name).toBe('dumb');
  });

  test('should accept function module as a plugin', () => {
    const api = {};
    callPlugins(api, './dumb-plugin-function');
    const plugins = (api as any).__plugins;
    expect(plugins.length).toBe(1);
    expect(plugins[0].name).toBe('function-plugin');
  });

  test('should accept inline function as a plugin', () => {
    const api = {};
    callPlugins(api, api => ((api as any).__test = true));

    expect((api as any).__test).toBe(true);
  });

  describe('array plugin', () => {
    test('should accept module and option', () => {
      const api = {};
      callPlugins(api, ['./dumb-plugin', { test: 1 }]);
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(1);
      expect(plugins[0].name).toBe('dumb');
      expect(plugins[0].options).toMatchObject({ test: 1 });
    });

    test('should accept module and name', () => {
      const api = {};
      callPlugins(api, ['./dumb-plugin', 'one']);
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(1);
      expect(plugins[0].name).toBe('dumb');
      expect(plugins[0].options).toMatchObject({});
    });

    test('should accept module, options and name', () => {
      const api = {};
      callPlugins(
        api,
        ['./dumb-plugin', { test: 1 }, 'one'],
        ['./dumb-plugin', { test: 2 }, 'two']
      );
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(2);
      expect(plugins[0].name).toBe('dumb');
      expect(plugins[0].options).toMatchObject({ test: 1 });
      expect(plugins[1].name).toBe('dumb');
      expect(plugins[1].options).toMatchObject({ test: 2 });
    });
  });
});
