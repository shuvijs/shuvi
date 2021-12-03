import {
  createSyncHook,
  createAsyncSeriesWaterfallHook,
  createHookGroup
} from '../../index';

beforeEach(() => {});

afterEach(async () => {});

describe('hookGroup', () => {
  console.log = jest.fn();
  test('basic', async () => {
    const hook = createSyncHook<void>();
    const group = createHookGroup({ hook });
    const { createPlugin, usePlugin, runner } = group;
    const pluginGenerater = (option: number) =>
      createPlugin({
        hook: () => {
          console.log(option);
        }
      });
    usePlugin(pluginGenerater(10), pluginGenerater(20));
    runner.hook();
    expect(console.log).toHaveBeenNthCalledWith(1, 10);
    expect(console.log).toHaveBeenNthCalledWith(2, 20);
  });

  test('cannot usePlugin after runner runs', async () => {
    const hook = createAsyncSeriesWaterfallHook<number>();
    const group = createHookGroup({ hook });
    const { createPlugin, usePlugin, runner } = group;
    const pluginGenerater = (option: number) =>
      createPlugin({
        hook: i => {
          return i * option;
        }
      });
    usePlugin(pluginGenerater(10), pluginGenerater(20));
    const result = await runner.hook(1);
    expect(result).toBe(200);
    usePlugin(pluginGenerater(2));
    const result2 = await runner.hook(1);
    expect(result2).toBe(200);
  });

  test('clear', async () => {
    const hook = createAsyncSeriesWaterfallHook<number>();
    const group = createHookGroup({ hook });
    const { createPlugin, usePlugin, runner, clear } = group;
    const pluginGenerater = (option: number) =>
      createPlugin({
        hook: i => {
          return i * option;
        }
      });
    usePlugin(pluginGenerater(10), pluginGenerater(20));
    const result = await runner.hook(1);
    expect(result).toBe(200);
    clear();
    const result2 = await runner.hook(1);
    expect(result2).toBe(1);
  });
});
