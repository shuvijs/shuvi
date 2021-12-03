import path from 'path';
import { createPlugin, runner, usePlugin, clear } from '../cliHooks';
import { IPluginConfig, IPresetConfig } from '..';
import { resolvePlugins, resolvePresets } from '../plugin';

function callPlugins(...plugins: IPluginConfig[]) {
  resolvePlugins(plugins, {
    dir: path.join(__dirname, 'fixtures/plugins')
  }).forEach(p => usePlugin(p));
}

function callPresets(context: any, ...presets: IPresetConfig[]) {
  resolvePresets(presets, {
    dir: path.join(__dirname, 'fixtures/presets')
  }).forEach(p => p.get()(context));
}

describe('plugin', () => {
  beforeEach(() => {
    clear();
  });
  test('should accept plugin instance object as a plugin', async () => {
    console.log = jest.fn();
    callPlugins('./simple-plugin-instance.ts');
    await runner.appReady();
    expect(console.log).toHaveBeenCalledWith('simple-plugin-instance');
  });

  test('should accept plugin instance creater with options as a plugin', async () => {
    console.log = jest.fn();
    const options = { name: 'test' };
    callPlugins(['./simple-plugin-instance-creater-with-options.ts', options]);
    await runner.appReady();
    expect(console.log).toHaveBeenCalledWith(options);
  });
  test('should accept inline plugin constructor object as a plugin', async () => {
    const api: any = {};
    callPlugins({
      appReady: () => {
        api.__test = true;
      }
    });
    await runner.appReady();
    expect(api.__test).toBe(true);
  });

  test('should accept inline plugin instance as a plugin', async () => {
    console.log = jest.fn();
    callPlugins(
      createPlugin({
        appReady: () => {
          console.log('simple-plugin-instance');
        }
      })
    );
    await runner.appReady();
    expect(console.log).toHaveBeenCalledWith('simple-plugin-instance');
  });

  test('should accept inline plugin instance creater with options as a plugin', async () => {
    console.log = jest.fn();
    const options = { name: 'test' };
    callPlugins([
      (options: any) =>
        createPlugin({
          appReady: () => {
            console.log(options);
          }
        }),
      options
    ]);
    await runner.appReady();
    expect(console.log).toHaveBeenCalledWith(options);
  });

  test('array plugin', async () => {
    console.log = jest.fn();
    const options = { name: 'test' };
    const api: any = {};
    callPlugins(
      {
        appReady: () => {
          api.__test = true;
        }
      },
      './simple-plugin-instance.ts',
      ['./simple-plugin-instance-creater-with-options.ts', options]
    );
    await runner.appReady();
    expect(api.__test).toBe(true);
    expect(console.log).toHaveBeenNthCalledWith(1, 'simple-plugin-instance');
    expect(console.log).toHaveBeenNthCalledWith(2, options);
  });
});

describe('preset', () => {
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
});
