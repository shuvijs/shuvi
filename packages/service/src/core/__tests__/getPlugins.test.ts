import * as path from 'path';
import { isPluginInstance, SyncHook, createSyncHook } from '@shuvi/hook';
import {
  createPlugin,
  getManager,
  PluginRunner,
  PluginManager
} from '../plugin';
import { getManager as getServerPluginManager } from '../../server/plugin';
import { IPluginConfig, IPresetConfig, ResolvedPlugin } from '../apiTypes';
import {
  resolvePlugin,
  resolvePreset as orignalResolvePreset
} from '../getPlugins';
import { getManager as getRuntimePluginManger } from './utils';

declare global {
  namespace ShuviService {
    interface CustomCorePluginHooks {
      test: SyncHook<void, void, string>;
    }
    interface CustomServerPluginHooks {
      test: SyncHook<void, void, string>;
    }
  }
}

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
  const createTestHook = () => createSyncHook<void, void, string>();
  manager.addHooks({
    test: createTestHook()
  });
  serverPluginManager.addHooks({
    test: createTestHook()
  });
});

const resolvePreset = (presetConfig: IPresetConfig, context: any) =>
  orignalResolvePreset(
    presetConfig,
    {
      dir: path.join(__dirname, 'fixtures', 'presets')
    },
    context
  );

const resolvePluginPath = (...paths: string[]) =>
  path.join(__dirname, 'fixtures', 'plugins', ...paths);
const resolvePresetPath = (...paths: string[]) =>
  path.join(__dirname, 'fixtures', 'presets', ...paths);

const applyPlugin = (resolvedPlugin: ResolvedPlugin) => {
  const { core, server, runtime } = resolvedPlugin;
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
};

const applyPlugins = (resolvedPlugins: ResolvedPlugin[]) => {
  resolvedPlugins.forEach(resolvedPlugin => {
    applyPlugin(resolvedPlugin);
  });
};

const resolveAndApplyPlugin = (pluginConfig: IPluginConfig) => {
  const plugin = resolvePlugin(pluginConfig, {
    dir: path.join(__dirname, 'fixtures', 'plugins')
  });
  applyPlugin(plugin);
  return plugin;
};

describe('resolve plugin', () => {
  describe('plugin can be a string', () => {
    describe('plugin can be relative path', () => {
      test('should resolve single corePlugin', async () => {
        const plugin = resolveAndApplyPlugin('./single-core');
        expect(isPluginInstance(plugin.core)).toBe(true);
        const result = runner.test();
        expect(result).toStrictEqual(['single-core']);
      });

      test('should resolve single corePlugin under directory', () => {
        const plugin = resolveAndApplyPlugin('./single-core-under-directory');
        expect(isPluginInstance(plugin.core)).toBe(true);
        const result = runner.test();
        expect(result).toStrictEqual(['single-core-under-directory']);
      });

      test('should resolve all three plugins and types', () => {
        const plugin = resolveAndApplyPlugin('./all-three-plugins');
        expect(isPluginInstance(plugin.core)).toBe(true);
        expect(isPluginInstance(plugin.server)).toBe(true);
        expect(plugin.runtime).toHaveProperty('plugin');
        expect(plugin.runtime?.options).toBeUndefined();
        const coreResult = runner.test();
        expect(coreResult).toStrictEqual(['all-three-plugins-core']);
        const serverResult = serverPluginRunner.test();
        expect(serverResult).toStrictEqual(['all-three-plugins-server']);
        const runtimeResult = runtimePluginRunner.test();
        expect(runtimeResult).toStrictEqual(['all-three-plugins-runtime']);
        expect(plugin.types).toBe(
          path.join(__dirname, 'fixtures/plugins/all-three-plugins/types')
        );
      });

      test('should resolve only server and runtime plugins', async () => {
        const plugin = resolveAndApplyPlugin('./only-server-and-runtime');
        expect(plugin.core).toBeUndefined();
        expect(isPluginInstance(plugin.server)).toBe(true);
        expect(plugin.runtime).toHaveProperty('plugin');
        expect(plugin.runtime?.options).toBeUndefined();
        const serverResult = serverPluginRunner.test();
        expect(serverResult).toStrictEqual(['only-server-and-runtime-server']);
        const runtimeResult = runtimePluginRunner.test();
        expect(runtimeResult).toStrictEqual([
          'only-server-and-runtime-runtime'
        ]);
      });
    });
    describe('plugin can be absolute path', () => {
      test('should resolve single corePlugin', async () => {
        const plugin = resolveAndApplyPlugin(
          resolvePluginPath('./single-core')
        );
        expect(isPluginInstance(plugin.core)).toBe(true);
        const result = runner.test();
        expect(result).toStrictEqual(['single-core']);
      });

      test('should resolve single corePlugin under directory', () => {
        const plugin = resolveAndApplyPlugin(
          resolvePluginPath('./single-core-under-directory')
        );
        expect(isPluginInstance(plugin.core)).toBe(true);
        const result = runner.test();
        expect(result).toStrictEqual(['single-core-under-directory']);
      });

      test('should resolve all three plugins and types', () => {
        const plugin = resolveAndApplyPlugin(
          resolvePluginPath('./all-three-plugins')
        );
        expect(isPluginInstance(plugin.core)).toBe(true);
        expect(isPluginInstance(plugin.server)).toBe(true);
        expect(plugin.runtime).toHaveProperty('plugin');
        expect(plugin.runtime?.options).toBeUndefined();
        const coreResult = runner.test();
        expect(coreResult).toStrictEqual(['all-three-plugins-core']);
        const serverResult = serverPluginRunner.test();
        expect(serverResult).toStrictEqual(['all-three-plugins-server']);
        const runtimeResult = runtimePluginRunner.test();
        expect(runtimeResult).toStrictEqual(['all-three-plugins-runtime']);
        expect(plugin.types).toBe(
          path.join(__dirname, 'fixtures/plugins/all-three-plugins/types')
        );
      });

      test('should resolve only server and runtime plugins', async () => {
        const plugin = resolveAndApplyPlugin(
          resolvePluginPath('./only-server-and-runtime')
        );
        expect(plugin.core).toBeUndefined();
        expect(isPluginInstance(plugin.server)).toBe(true);
        expect(plugin.runtime).toHaveProperty('plugin');
        expect(plugin.runtime?.options).toBeUndefined();
        const serverResult = serverPluginRunner.test();
        expect(serverResult).toStrictEqual(['only-server-and-runtime-server']);
        const runtimeResult = runtimePluginRunner.test();
        expect(runtimeResult).toStrictEqual([
          'only-server-and-runtime-runtime'
        ]);
      });
    });
  });

  describe('plugin can be an object', () => {
    test('plugin can be core plugin instance object', () => {
      resolveAndApplyPlugin(
        createPlugin({
          test: () => 'instance'
        })
      );
      const result = runner.test();
      expect(result).toStrictEqual(['instance']);
    });

    test('plugin can be core plugin constructor object', () => {
      resolveAndApplyPlugin({
        test: () => 'instance'
      });
      const result = runner.test();
      expect(result).toStrictEqual(['instance']);
    });

    test('plugin can be SplitPluginConfig', async () => {
      const plugin = resolveAndApplyPlugin({
        core: resolvePluginPath('./all-three-plugins', 'index.js'),
        server: resolvePluginPath('./all-three-plugins', 'server.js'),
        runtime: resolvePluginPath('./all-three-plugins', 'runtime.js'),
        types: resolvePluginPath('./all-three-plugins', 'types.d.ts')
      });
      expect(isPluginInstance(plugin.core)).toBe(true);
      expect(isPluginInstance(plugin.server)).toBe(true);
      expect(plugin.runtime).toHaveProperty('plugin');
      expect(plugin.runtime?.options).toBeUndefined();
      const coreResult = runner.test();
      expect(coreResult).toStrictEqual(['all-three-plugins-core']);
      const serverResult = serverPluginRunner.test();
      expect(serverResult).toStrictEqual(['all-three-plugins-server']);
      const runtimeResult = runtimePluginRunner.test();
      expect(runtimeResult).toStrictEqual(['all-three-plugins-runtime']);
      expect(plugin.types).toBe(
        path.join(__dirname, 'fixtures/plugins/all-three-plugins/types')
      );
    });
  });

  describe('plugin can be an array: in this situation, first item is the main plugin and the second item is plugin options', () => {
    describe('first item is string', () => {
      test('should resolve single corePlugin with options', () => {
        const options = 'single-core-with-options';
        const plugin = resolveAndApplyPlugin([
          './single-core-with-options',
          options
        ]);
        expect(isPluginInstance(plugin.core)).toBe(true);
        const result = runner.test();
        expect(result).toStrictEqual([options]);
      });

      test('should resolve single corePlugin under directory with options', () => {
        const options = 'single-core-under-directory-with-options';
        const plugin = resolveAndApplyPlugin([
          './single-core-under-directory-with-options',
          options
        ]);
        expect(isPluginInstance(plugin.core)).toBe(true);
        const result = runner.test();
        expect(result).toStrictEqual([options]);
      });

      test('should resolve all three plugins with options', () => {
        const options = { name: 'all-three-plugins-with-options' };
        const plugin = resolveAndApplyPlugin([
          './all-three-plugins-with-options',
          options
        ]);
        expect(isPluginInstance(plugin.core)).toBe(true);
        expect(isPluginInstance(plugin.server)).toBe(true);
        expect(plugin.runtime).toHaveProperty('plugin');
        expect(plugin.runtime?.options).toBe(options);
        const coreResult = runner.test();
        expect(coreResult).toStrictEqual([options.name + 'core']);
        const serverResult = serverPluginRunner.test();
        expect(serverResult).toStrictEqual([options.name + 'server']);
        const runtimeResult = runtimePluginRunner.test();
        expect(runtimeResult).toStrictEqual([options.name + 'runtime']);
      });

      test('should resolve only server and runtime plugins with options', async () => {
        const options = { name: 'only-server-and-runtime' };
        const plugin = resolveAndApplyPlugin([
          './only-server-and-runtime-with-options',
          options
        ]);
        expect(plugin.core).toBeUndefined();
        expect(isPluginInstance(plugin.server)).toBe(true);
        expect(plugin.runtime).toHaveProperty('plugin');
        expect(plugin.runtime?.options).toBe(options);
        const serverResult = serverPluginRunner.test();
        expect(serverResult).toStrictEqual([options.name + 'server']);
        const runtimeResult = runtimePluginRunner.test();
        expect(runtimeResult).toStrictEqual([options.name + 'runtime']);
      });
    });
    describe('first item is SplitPluginConfig', () => {
      test('should work', () => {
        const options = { name: 'all-three-plugins' };
        const plugin = resolveAndApplyPlugin([
          {
            core: resolvePluginPath(
              './all-three-plugins-with-options',
              'index.js'
            ),
            server: resolvePluginPath(
              './all-three-plugins-with-options',
              'server.js'
            ),
            runtime: resolvePluginPath(
              './all-three-plugins-with-options',
              'runtime.js'
            ),
            types: resolvePluginPath(
              './all-three-plugins-with-options',
              'types.d.ts'
            )
          },
          options
        ]);
        console.warn('plugin', plugin);
        expect(isPluginInstance(plugin.core)).toBe(true);
        expect(isPluginInstance(plugin.server)).toBe(true);
        expect(plugin.runtime).toHaveProperty('plugin');
        expect(plugin.runtime?.options).toBe(options);
        const coreResult = runner.test();
        expect(coreResult).toStrictEqual([options.name + 'core']);
        const serverResult = serverPluginRunner.test();
        expect(serverResult).toStrictEqual([options.name + 'server']);
        const runtimeResult = runtimePluginRunner.test();
        expect(runtimeResult).toStrictEqual([options.name + 'runtime']);
      });
    });
  });
});

describe('resolve preset', () => {
  describe('presetConfig format', () => {
    describe('presetConfig can be a string', () => {
      describe('presetConfig can be relative path', () => {
        const resolved = resolvePreset('./multiple-plugins', {});
        expect(resolved.length).toBe(2);
      });
      describe('preset can be absolute path', () => {
        const resolved = resolvePreset(
          resolvePresetPath('./multiple-plugins'),
          {}
        );
        expect(resolved.length).toBe(2);
      });
    });

    describe('preset can be an array which means it has an option', () => {
      const resolved = resolvePreset(['./multiple-plugins', {}], {});
      expect(resolved.length).toBe(2);
    });
  });
  describe('params of preset function should work', () => {
    test('first param of preset function should be context', async () => {
      const context = {
        __presets: [] as { name: string; options: any }[]
      };
      resolvePreset('simple', context);
      expect(context.__presets.length).toBe(1);
      expect(context.__presets[0].name).toBe('simple');
      expect(context.__presets[0].options).toBeUndefined();
    });
    test('second param of preset function should be options if provided', async () => {
      const context = {
        __presets: [] as { name: string; options: any }[]
      };
      const options = {
        hello: 'world'
      };
      resolvePreset(['simple', options], context);
      expect(context.__presets.length).toBe(1);
      expect(context.__presets[0].name).toBe('simple');
      expect(context.__presets[0].options).toBe(options);
    });
  });

  describe('resolved plugin should work', () => {
    test('resolvePreset should return resolved plugins', () => {
      const resolved = resolvePreset('./multiple-plugins', {});
      expect(resolved.length).toBe(2);
      applyPlugins(resolved);
      const coreResult = runner.test();
      expect(coreResult).toStrictEqual([
        'single-core',
        'all-three-plugins-core'
      ]);
      const serverResult = serverPluginRunner.test();
      expect(serverResult).toStrictEqual(['all-three-plugins-server']);
      const runtimeResult = runtimePluginRunner.test();
      expect(runtimeResult).toStrictEqual(['all-three-plugins-runtime']);
    });

    test('resolvePreset should return resolved plugins if plugins have options', () => {
      const name = 'multiple-plugins-with-options';
      const options = { name };
      const resolved = resolvePreset(
        ['./multiple-plugins-with-options', options],
        {}
      );
      expect(resolved.length).toBe(2);
      applyPlugins(resolved);
      const coreResult = runner.test();
      expect(coreResult).toStrictEqual([name, name + 'core']);
      const serverResult = serverPluginRunner.test();
      expect(serverResult).toStrictEqual([name + 'server']);
      const runtimeResult = runtimePluginRunner.test();
      expect(runtimeResult).toStrictEqual([name + 'runtime']);
    });

    test('resolvePreset should return all resolved plugins if there are nested presets', () => {
      const name = 'nested-presets';
      const options = { name };
      const resolved = resolvePreset(['./nested-presets', options], {});
      expect(resolved.length).toBe(6);
      applyPlugins(resolved);
      const coreResult = runner.test();
      expect(coreResult).toStrictEqual([
        'single-core',
        'all-three-plugins-core',
        name,
        name + 'core'
      ]);
      const serverResult = serverPluginRunner.test();
      expect(serverResult).toStrictEqual([
        'only-server-and-runtime-server',
        name + 'server',
        'all-three-plugins-server',
        name + 'server'
      ]);
      const runtimeResult = runtimePluginRunner.test();
      expect(runtimeResult).toStrictEqual([
        'only-server-and-runtime-runtime',
        name + 'runtime',
        'all-three-plugins-runtime',
        name + 'runtime'
      ]);
    });
  });
});
