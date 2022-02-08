import path from 'path';
import {
  createPlugin,
  getManager,
  PluginRunner,
  PluginManager,
} from '../plugin';
import { IPluginConfig, IPresetConfig } from '../apiTypes';
import { IPluginContext } from '..'
import { resolvePlugins, resolvePresets, getPlugins } from '../getPlugins';
import { resolvePreset } from './utils';

function callPresets(context: any, ...presets: IPresetConfig[]) {
  resolvePresets(presets, {
    dir: path.join(__dirname, 'fixtures/presets')
  }).forEach(p => p.get()(context));
}

describe('plugin', () => {
  let manager: PluginManager;
  let runner: PluginRunner;

  function callPlugins(...plugins: IPluginConfig[]) {
    resolvePlugins(plugins, {
      dir: path.join(__dirname, 'fixtures/plugins')
    }).forEach(p => manager.usePlugin(p));
  }

  beforeEach(() => {
    manager = getManager();
    runner = manager.runner;
    manager.setContext({} as IPluginContext)
  });
  test('should accept plugin instance object as a plugin', async () => {
    console.log = jest.fn();
    callPlugins('./simple-plugin-instance.ts');
    await runner.afterInit();
    expect(console.log).toHaveBeenCalledWith('simple-plugin-instance');
  });

  test('should accept plugin instance creater with options as a plugin', async () => {
    console.log = jest.fn();
    const options = { name: 'test' };
    callPlugins(['./simple-plugin-instance-creater-with-options.ts', options]);
    await runner.afterInit();
    expect(console.log).toHaveBeenCalledWith(options);
  });
  test('should accept inline plugin constructor object as a plugin', async () => {
    const api: any = {};
    callPlugins({
      afterInit: () => {
        api.__test = true;
      }
    });
    await runner.afterInit();
    expect(api.__test).toBe(true);
  });

  test('should accept inline plugin instance as a plugin', async () => {
    console.log = jest.fn();
    callPlugins(
      createPlugin({
        afterInit: () => {
          console.log('simple-plugin-instance');
        }
      })
    );
    await runner.afterInit();
    expect(console.log).toHaveBeenCalledWith('simple-plugin-instance');
  });

  test('should accept inline plugin instance creater with options as a plugin', async () => {
    console.log = jest.fn();
    const options = { name: 'test' };
    callPlugins([
      (options: any) =>
        createPlugin({
          afterInit: () => {
            console.log(options);
          }
        }),
      options
    ]);
    await runner.afterInit();
    expect(console.log).toHaveBeenCalledWith(options);
  });

  test('array plugin', async () => {
    console.log = jest.fn();
    const options = { name: 'test' };
    const api: any = {};
    callPlugins(
      {
        afterInit: () => {
          api.__test = true;
        }
      },
      './simple-plugin-instance.ts',
      ['./simple-plugin-instance-creater-with-options.ts', options]
    );
    await runner.afterInit();
    expect(api.__test).toBe(true);
    expect(console.log).toHaveBeenNthCalledWith(1, 'simple-plugin-instance');
    expect(console.log).toHaveBeenNthCalledWith(2, options);
  });
});

describe('preset', () => {
  test('should works', async () => {
    const plugins = await getPlugins('/', {
      presets: [resolvePreset('a-b-preset')]
    } as any);
    expect(plugins.length).toBe(2);
    expect(plugins[0].name).toBe('a');
    expect(plugins[1].name).toMatch('b');
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
    expect(plugins[0].name).toBe('a');
    expect(plugins[1].name).toMatch('b');
    expect(plugins[2].name).toMatch('c');
  });
});
