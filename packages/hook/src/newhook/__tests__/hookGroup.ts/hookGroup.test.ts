import {
  createSyncHook,
  createAsyncSeriesWaterfallHook,
  createHookManager
} from '../../index';

describe('hookManager', () => {
  console.log = jest.fn();
  test('basic', async () => {
    const hook = createSyncHook<void>();
    const group = createHookManager({ hook }, false);
    const { createPlugin, usePlugin, runner } = group;
    const pluginGenerator = (option: number) =>
      createPlugin({
        hook: () => {
          console.log(option);
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    runner.hook();
    expect(console.log).toHaveBeenNthCalledWith(1, 10);
    expect(console.log).toHaveBeenNthCalledWith(2, 20);
  });

  test('context', async () => {
    const hook = createSyncHook<void>();
    const hooks = { hook }
    const group = createHookManager<typeof hooks, number>(hooks);
    const { createPlugin, setContext, usePlugin, runner } = group;
    let number = 1
    const pluginGenerator = (option: number) =>
      createPlugin({
        hook: (context) => {
          number = (number + context) * option
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    expect(() => {
      runner.hook();
    }).toThrowError('Context not set. Hook hook running failed.')
    setContext(5)
    runner.hook();
    expect(number).toBe(1300)
  });

  test('addHooks', async () => {
    let hookNumber = 0
    let extraHookNumber = 1
    const hook = createSyncHook<void>();
    const extraHook = createSyncHook<void>();
    const baseHooks = { hook }
    const extraHooks = { extraHook }
    const group = createHookManager<typeof baseHooks, void, typeof extraHooks>(baseHooks, false);
    const { createPlugin, usePlugin, runner, addHooks } = group;
    const pluginGenerator = (option: number) =>
      createPlugin({
        hook: () => {
          hookNumber += option
        },
        extraHook: () => {
          extraHookNumber *= option
        },
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    runner.extraHook()
    expect(extraHookNumber).toBe(1)
    addHooks({ extraHook })
    runner.hook()
    expect(hookNumber).toBe(30)
    expect(extraHookNumber).toBe(1)
    runner.extraHook()
    expect(extraHookNumber).toBe(200)
  });

  test('setup should be executed at the very first runner runs', async () => {
    const hook = createSyncHook<void>();
    const group = createHookManager({ hook }, false);
    const { createPlugin, usePlugin, runner } = group;
    let number = 1
    const pluginGenerator = (option: number) =>
      createPlugin({
        setup: () => {
          number *= option
        },
        hook: () => {
          number += option
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    runner.hook();
    expect(number).toBe(230)
  });

  test('addHooks shoule be available at setup', async () => {
    let hookNumber = 0
    let extraHookNumber = 1
    const hook = createSyncHook<void>();
    const extraHook = createSyncHook<void>();
    const baseHooks = { hook }
    const extraHooks = { extraHook }
    const group = createHookManager<typeof baseHooks, void, typeof extraHooks>(baseHooks, false);
    const { createPlugin, usePlugin, runner } = group;
    const pluginGenerator = (option: number) =>
      createPlugin({
        setup: ({ addHooks }) => {
          addHooks({ extraHook })
        },
        hook: () => {
          hookNumber += option
        },
        extraHook: () => {
          extraHookNumber *= option
        },
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    expect(extraHookNumber).toBe(1)
    runner.extraHook()
    expect(extraHookNumber).toBe(200)
    runner.hook()
    expect(hookNumber).toBe(30)
  });

  test('addHooks shoule be only available inside setup hook', async () => {
    let hookNumber = 0
    let extraHookNumber = 1
    const hook = createSyncHook<void>();
    const extraHook = createSyncHook<void>();
    const baseHooks = { hook }
    const extraHooks = { extraHook }
    const group = createHookManager<typeof baseHooks, void, typeof extraHooks>(baseHooks, false);
    const { createPlugin, usePlugin, runner } = group;
    let addHooksMethod: any
    const pluginGenerator = (option: number) =>
      createPlugin({
        setup: ({ addHooks }) => {
          addHooksMethod = addHooks
        },
        hook: () => {
          hookNumber += option
          // will not work
          addHooksMethod(extraHooks)
        },
        extraHook: () => {
          extraHookNumber *= option
        },
      });
    usePlugin(pluginGenerator(10));
    runner.hook()
    expect(hookNumber).toBe(10)
    runner.extraHook()
    expect(extraHookNumber).toBe(1)
  });

  test('cannot usePlugin after runner runs', async () => {
    const hook = createAsyncSeriesWaterfallHook<number>();
    const group = createHookManager({ hook }, false);
    const { createPlugin, usePlugin, runner } = group;
    const pluginGenerator = (option: number) =>
      createPlugin({
        hook: i => {
          return i * option;
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    const result = await runner.hook(1);
    expect(result).toBe(200);
    usePlugin(pluginGenerator(2));
    const result2 = await runner.hook(1);
    expect(result2).toBe(200);
  });

  test('clear', async () => {
    const hook = createAsyncSeriesWaterfallHook<number>();
    const group = createHookManager({ hook }, false);
    const { createPlugin, usePlugin, runner, clear } = group;
    const pluginGenerator = (option: number) =>
      createPlugin({
        hook: i => {
          return i * option;
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    const result = await runner.hook(1);
    expect(result).toBe(200);
    clear();
    const result2 = await runner.hook(1);
    expect(result2).toBe(1);
    clear();
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    const result3 = await runner.hook(1);
    expect(result3).toBe(200);
  });
});

