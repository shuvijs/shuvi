import * as path from 'path';
import { isPluginInstance, SyncHook } from '@shuvi/hook';
import {
  createPlugin,
  getManager,
  PluginRunner,
  PluginManager
} from '../lifecycle';
import { getManager as getServerPluginManager } from '../../server/plugin';
import { IPluginConfig, IPresetConfig } from '../apiTypes';
import { resolvePlugin, resolvePresets, getPlugins } from '../getPlugins';
import { resolvePreset, getManager as getRuntimePluginManger } from './utils';

declare global {
  namespace ShuviService {
    interface CustomServerPluginHooks {
      test: SyncHook;
    }
  }
}

function callPresets(context: any, ...presets: IPresetConfig[]) {
  resolvePresets(presets, {
    dir: path.join(__dirname, 'fixtures/presets')
  }).forEach(p => p.get()(context));
}

describe('resolve plugin', () => {
  let manager: PluginManager;
  let runner: PluginRunner;
  let serverPluginManager: ReturnType<typeof getServerPluginManager>;
  let serverPluginRunner: ReturnType<typeof getServerPluginManager>['runner'];
  let runtimePluginManger: ReturnType<typeof getRuntimePluginManger>;
  let runtimePluginRunner: ReturnType<typeof getRuntimePluginManger>['runner'];
  beforeEach(() => {
    manager = getManager();
    runner = manager.runner;
    manager.setContext({} as any);
    serverPluginManager = getServerPluginManager();
    serverPluginManager.setContext({} as any);
    serverPluginRunner = serverPluginManager.runner;
    runtimePluginManger = getRuntimePluginManger();
    runtimePluginManger.setContext({} as any);
    runtimePluginRunner = runtimePluginManger.runner;
  });

  const applyPlugin = (pluginConfig: IPluginConfig) => {
    const plugin = resolvePlugin(pluginConfig, {
      dir: path.join(__dirname, 'fixtures/plugins')
    });
    const { core, server, runtime } = plugin;
    if (core) {
      manager.usePlugin(core);
    }
    if (server) {
      serverPluginManager.usePlugin(server);
    }
    if (runtime) {
      let runtimePlugin = require(runtime.plugin);
      runtimePlugin = runtimePlugin.default || runtimePlugin;
      if (isPluginInstance(runtimePlugin)) {
        runtimePluginManger.usePlugin(runtimePlugin);
      } else {
        runtimePluginManger.usePlugin(runtimePlugin(runtime.options));
      }
    }
    return plugin;
  };
  describe('plugin is a string', () => {
    test('should resolve single corePlugin', async () => {
      console.log = jest.fn();
      const plugin = applyPlugin('./single-core');
      expect(isPluginInstance(plugin.core)).toBe(true);
      await runner.afterInit();
      expect(console.log).toHaveBeenCalledWith('single-core');
    });

    test('should resolve single corePlugin with options', async () => {
      console.log = jest.fn();
      const options = 'single-core-with-options';
      const plugin = applyPlugin(['./single-core-with-options', options]);
      expect(isPluginInstance(plugin.core)).toBe(true);
      await runner.afterInit();
      expect(console.log).toHaveBeenCalledWith(options);
    });

    test('should resolve single corePlugin under directory', async () => {
      console.log = jest.fn();
      const plugin = applyPlugin('./single-core');
      expect(isPluginInstance(plugin.core)).toBe(true);
      await runner.afterInit();
      expect(console.log).toHaveBeenCalledWith('single-core');
    });

    test('should resolve single corePlugin under directory with options', async () => {
      console.log = jest.fn();
      const options = 'single-core-with-options';
      const plugin = applyPlugin(['./single-core-with-options', options]);
      expect(isPluginInstance(plugin.core)).toBe(true);
      await runner.afterInit();
      expect(console.log).toHaveBeenCalledWith(options);
    });

    test('should resolve all three plugins and types', async () => {
      console.log = jest.fn();
      const plugin = applyPlugin('./all-three-plugins');
      expect(isPluginInstance(plugin.core)).toBe(true);
      expect(isPluginInstance(plugin.server)).toBe(true);
      expect(plugin.runtime).toHaveProperty('plugin');
      expect(plugin.runtime?.options).toBeUndefined();
      await runner.afterInit();
      expect(console.log).toHaveBeenCalledWith('all-three-plugins-core');
      serverPluginRunner.test();
      expect(console.log).toHaveBeenCalledWith('all-three-plugins-server');
      runtimePluginRunner.test();
      expect(console.log).toHaveBeenCalledWith('all-three-plugins-runtime');
      expect(plugin.types).toBe(
        path.join(__dirname, 'fixtures/plugins/all-three-plugins/types')
      );
    });

    test('should resolve all three plugins with options', async () => {
      console.log = jest.fn();
      const options = { name: 'all-three-plugins' };
      const plugin = applyPlugin(['./all-three-plugins-with-options', options]);
      expect(isPluginInstance(plugin.core)).toBe(true);
      expect(isPluginInstance(plugin.server)).toBe(true);
      expect(plugin.runtime).toHaveProperty('plugin');
      expect(plugin.runtime?.options).toBe(options);
      await runner.afterInit();
      expect(console.log).toHaveBeenCalledWith(options.name + 'core');
      serverPluginRunner.test();
      expect(console.log).toHaveBeenCalledWith(options.name + 'server');
      runtimePluginRunner.test();
      expect(console.log).toHaveBeenCalledWith(options.name + 'runtime');
    });

    test('should resolve only server and runtime plugins', async () => {
      console.log = jest.fn();
      const plugin = applyPlugin('./only-server-and-runtime');
      expect(plugin.core).toBeUndefined();
      expect(isPluginInstance(plugin.server)).toBe(true);
      expect(plugin.runtime).toHaveProperty('plugin');
      expect(plugin.runtime?.options).toBeUndefined();
      serverPluginRunner.test();
      expect(console.log).toHaveBeenCalledWith('all-three-plugins-server');
      runtimePluginRunner.test();
      expect(console.log).toHaveBeenCalledWith('all-three-plugins-runtime');
    });

    test('should resolve only server and runtime plugins with options', async () => {
      console.log = jest.fn();
      const options = { name: 'only-server-and-runtime' };
      const plugin = applyPlugin([
        './only-server-and-runtime-with-options',
        options
      ]);
      expect(plugin.core).toBeUndefined();
      expect(isPluginInstance(plugin.server)).toBe(true);
      expect(plugin.runtime).toHaveProperty('plugin');
      expect(plugin.runtime?.options).toBe(options);
      serverPluginRunner.test();
      expect(console.log).toHaveBeenCalledWith(options.name + 'server');
      runtimePluginRunner.test();
      expect(console.log).toHaveBeenCalledWith(options.name + 'runtime');
    });
  });

  describe('plugin is a object: inline plugin', () => {
    test('should resolve core plugin instance object', async () => {
      const api: any = {};
      applyPlugin(
        createPlugin({
          afterInit: () => {
            api.__test = true;
          }
        })
      );
      await runner.afterInit();
      expect(api.__test).toBe(true);
    });

    test('should resolve core plugin constructor object', async () => {
      const api: any = {};
      applyPlugin({
        afterInit: () => {
          api.__test = true;
        }
      });
      await runner.afterInit();
      expect(api.__test).toBe(true);
    });
  });
});

describe('preset', () => {
  test('should works', async () => {
    const plugins = await getPlugins('/', {
      presets: [resolvePreset('a-b-preset')]
    } as any);
    expect(plugins.length).toBe(2);
    expect(plugins[0].core?.name).toBe('a');
    expect(plugins[1].core?.name).toMatch('b');
  });

  test('should accept function module as a plugin', () => {
    const context = {};
    callPresets(context, './simple-preset');
    const presets = (context as any).__presets;
    expect(presets.length).toBe(1);
    expect(presets[0].name).toBe('simple-preset');
  });

  test('should accept module and option', () => {
    const context = {};
    callPresets(context, ['./simple-preset', { test: 1 }]);
    const presets = (context as any).__presets;
    expect(presets.length).toBe(1);
    expect(presets[0].name).toBe('simple-preset');
    expect(presets[0].options).toMatchObject({ test: 1 });
  });

  test('should work with nested preset', async () => {
    const plugins = await getPlugins('/', {
      presets: [resolvePreset('nest-preset-preset')]
    } as any);
    expect(plugins.length).toBe(3);
    expect(plugins[0].core?.name).toBe('a');
    expect(plugins[1].core?.name).toMatch('b');
    expect(plugins[2].core?.name).toMatch('c');
  });
});
