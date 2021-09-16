import path from 'path';
import { IPluginConfig, IPresetConfig } from '..';
import { resolvePlugins, resolvePresets } from '../plugin';

function callPlugins(context: any, ...plugins: IPluginConfig[]) {
  resolvePlugins(plugins, {
    dir: path.join(__dirname, 'fixtures/plugins')
  }).forEach(p => p.get().apply(context));
}

function callPresets(context: any, ...presets: IPresetConfig[]) {
  resolvePresets(presets, {
    dir: path.join(__dirname, 'fixtures/presets')
  }).forEach(p => p.get()(context));
}

describe('plugin', () => {
  test('should accept class module as a plugin', () => {
    const api = {};
    callPlugins(api, './simple-class');
    const plugins = (api as any).__plugins;
    expect(plugins.length).toBe(1);
    expect(plugins[0].name).toBe('simple-class');
  });

  test('should accept function module as a plugin', () => {
    const api = {};
    callPlugins(api, './simple-function');
    const plugins = (api as any).__plugins;
    expect(plugins.length).toBe(1);
    expect(plugins[0].name).toBe('simple-function');
  });

  test('should accept inline function as a plugin', () => {
    const api = {};
    callPlugins(api, api => ((api as any).__test = true));

    expect((api as any).__test).toBe(true);
  });

  describe('array plugin', () => {
    test('should accept module and option', () => {
      const api = {};
      callPlugins(api, ['./simple-class', { test: 1 }]);
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(1);
      expect(plugins[0].name).toBe('simple-class');
      expect(plugins[0].options).toMatchObject({ test: 1 });
    });

    test('should accept module and name', () => {
      const api = {};
      callPlugins(api, ['./simple-class', 'one']);
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(1);
      expect(plugins[0].name).toBe('simple-class');
      expect(plugins[0].options).toMatchObject({});
    });

    test('should accept module, options and name', () => {
      const api = {};
      callPlugins(
        api,
        ['./simple-class', { test: 1 }, 'one'],
        ['./simple-class', { test: 2 }, 'two']
      );
      const plugins = (api as any).__plugins;

      expect(plugins.length).toBe(2);
      expect(plugins[0].name).toBe('simple-class');
      expect(plugins[0].options).toMatchObject({ test: 1 });
      expect(plugins[1].name).toBe('simple-class');
      expect(plugins[1].options).toMatchObject({ test: 2 });
    });
  });
});

describe('preset', () => {
  test('should accept function module as a plugin', () => {
    const api = {};
    callPresets(api, './simple-preset');
    const presets = (api as any).__presets;
    expect(presets.length).toBe(1);
    expect(presets[0].name).toBe('simple-preset');
  });

  test('should accept module and option', () => {
    const api = {};
    callPresets(api, ['./simple-preset', { test: 1 }]);
    const presets = (api as any).__presets;
    expect(presets.length).toBe(1);
    expect(presets[0].name).toBe('simple-preset');
    expect(presets[0].options).toMatchObject({ test: 1 });
  });
});
