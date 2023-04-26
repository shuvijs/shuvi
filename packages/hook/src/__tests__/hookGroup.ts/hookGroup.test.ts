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
    const hooks = { hook };
    const group = createHookManager<typeof hooks, number>(hooks);
    const { createPlugin, setContext, usePlugin, runner } = group;
    let number = 1;
    const pluginGenerator = (option: number) =>
      createPlugin({
        hook: context => {
          number = (number + context) * option;
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    expect(() => {
      runner.hook();
    }).toThrowError('Context not set. Hook hook running failed.');
    setContext(5);
    runner.hook();
    expect(number).toBe(1300);
  });

  test('addHooks', async () => {
    let hookNumber = 0;
    let extraHookNumber = 1;
    const hook = createSyncHook<void>();
    const extraHook = createSyncHook<void>();
    const baseHooks = { hook };
    const extraHooks = { extraHook };
    const group = createHookManager<typeof baseHooks & typeof extraHooks>(
      baseHooks as any,
      false
    );
    const { createPlugin, usePlugin, runner, addHooks } = group;
    const pluginGenerator = (option: number) =>
      createPlugin({
        hook: () => {
          hookNumber += option;
        },
        extraHook: () => {
          extraHookNumber *= option;
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    runner.extraHook();
    expect(extraHookNumber).toBe(1);
    addHooks({ extraHook });
    runner.hook();
    expect(hookNumber).toBe(30);
    expect(extraHookNumber).toBe(1);
    runner.extraHook();
    expect(extraHookNumber).toBe(200);
  });

  test('setup should be executed at the very first runner runs', async () => {
    const hook = createSyncHook<void>();
    const group = createHookManager({ hook }, false);
    const { createPlugin, usePlugin, runner } = group;
    let number = 1;
    const pluginGenerator = (option: number) =>
      createPlugin({
        setup: () => {
          number *= option;
        },
        hook: () => {
          number += option;
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    runner.hook();
    expect(number).toBe(230);
  });

  test('addHooks should be available at setup', async () => {
    let hookNumber = 0;
    let extraHookNumber = 1;
    const hook = createSyncHook<void>();
    const extraHook = createSyncHook<void>();
    const baseHooks = { hook };
    const extraHooks = { extraHook };
    const group = createHookManager<typeof baseHooks & typeof extraHooks>(
      baseHooks as any,
      false
    );
    const { createPlugin, usePlugin, runner } = group;
    const pluginGenerator = (option: number) =>
      createPlugin({
        setup: ({ addHooks }) => {
          addHooks({ extraHook });
        },
        hook: () => {
          hookNumber += option;
        },
        extraHook: () => {
          extraHookNumber *= option;
        }
      });
    usePlugin(pluginGenerator(10), pluginGenerator(20));
    expect(extraHookNumber).toBe(1);
    runner.extraHook();
    expect(extraHookNumber).toBe(200);
    runner.hook();
    expect(hookNumber).toBe(30);
  });

  test('addHooks should be only available inside setup hook', async () => {
    let hookNumber = 0;
    let extraHookNumber = 1;
    const hook = createSyncHook<void>();
    const extraHook = createSyncHook<void>();
    const baseHooks = { hook };
    const extraHooks = { extraHook };
    const group = createHookManager<typeof baseHooks & typeof extraHooks>(
      baseHooks as any,
      false
    );
    const { createPlugin, usePlugin, runner } = group;
    let addHooksMethod: any;
    const pluginGenerator = (option: number) =>
      createPlugin({
        setup: ({ addHooks }) => {
          addHooksMethod = addHooks;
        },
        hook: () => {
          hookNumber += option;
          // will not work
          addHooksMethod(extraHooks);
        },
        extraHook: () => {
          extraHookNumber *= option;
        }
      });
    usePlugin(pluginGenerator(10));
    runner.hook();
    expect(hookNumber).toBe(10);
    runner.extraHook();
    expect(extraHookNumber).toBe(1);
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

  describe('getPlugins', () => {
    test(`getPlugins should get plugins after calling 'usePlugin'`, async () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner, getPlugins } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a',
          before: ['b', 'c']
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          before: ['c']
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c'
        }
      );

      usePlugin(pluginA);

      expect(getPlugins()).toStrictEqual([pluginA]);

      usePlugin(pluginB);

      expect(getPlugins()).toStrictEqual([pluginA, pluginB]);

      usePlugin(pluginC);

      expect(getPlugins()).toStrictEqual([pluginA, pluginB, pluginC]);

      const result = await runner.hook();
      expect(result).toStrictEqual(['a', 'b', 'c']);
    });

    test(`getPlugins should get sorted plugins after calling runner`, async () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner, getPlugins } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a',
          after: ['b', 'c']
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b'
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c'
        }
      );

      usePlugin(pluginA, pluginB, pluginC);
      const result = await runner.hook();
      expect(result).toStrictEqual(['b', 'c', 'a']);
      expect(getPlugins()).toStrictEqual([pluginB, pluginC, pluginA]);
    });
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

describe('plugin options', () => {
  describe('basic plugin order', () => {
    describe(`when set 'before' option, current plugin should before those configured plugins.`, () => {
      test('when initial order is right', async () => {
        const hook = createSyncHook<void, void, string>();
        const group = createHookManager({ hook }, false);
        const { createPlugin, usePlugin, runner } = group;

        const pluginA = createPlugin(
          {
            hook: () => 'a'
          },
          {
            name: 'a',
            before: ['b', 'c']
          }
        );

        const pluginB = createPlugin(
          {
            hook: () => 'b'
          },
          {
            name: 'b',
            before: ['c']
          }
        );

        const pluginC = createPlugin(
          {
            hook: () => 'c'
          },
          {
            name: 'c'
          }
        );

        usePlugin(pluginA, pluginB, pluginC);
        const result = await runner.hook();
        expect(result).toStrictEqual(['a', 'b', 'c']);
      });
      test('when initial order is wrong', async () => {
        const hook = createSyncHook<void, void, string>();
        const group = createHookManager({ hook }, false);
        const { createPlugin, usePlugin, runner } = group;

        const pluginA = createPlugin(
          {
            hook: () => 'a'
          },
          {
            name: 'a'
          }
        );

        const pluginB = createPlugin(
          {
            hook: () => 'b'
          },
          {
            name: 'b'
          }
        );

        const pluginC = createPlugin(
          {
            hook: () => 'c'
          },
          {
            name: 'c',
            before: ['a']
          }
        );

        usePlugin(pluginA, pluginB, pluginC);
        const result = await runner.hook();
        expect(result).toStrictEqual(['b', 'c', 'a']);
      });
    });

    describe(`when set 'after' option, current plugin should after those configured plugins.`, () => {
      test('when initial order is right', async () => {
        const hook = createSyncHook<void, void, string>();
        const group = createHookManager({ hook }, false);
        const { createPlugin, usePlugin, runner } = group;

        const pluginA = createPlugin(
          {
            hook: () => 'a'
          },
          {
            name: 'a'
          }
        );

        const pluginB = createPlugin(
          {
            hook: () => 'b'
          },
          {
            name: 'b',
            after: ['a']
          }
        );

        const pluginC = createPlugin(
          {
            hook: () => 'c'
          },
          {
            name: 'c',
            after: ['a', 'b']
          }
        );

        usePlugin(pluginA, pluginB, pluginC);
        const result = await runner.hook();
        expect(result).toStrictEqual(['a', 'b', 'c']);
      });

      test('when initial order is wrong', async () => {
        const hook = createSyncHook<void, void, string>();
        const group = createHookManager({ hook }, false);
        const { createPlugin, usePlugin, runner } = group;

        const pluginA = createPlugin(
          {
            hook: () => 'a'
          },
          {
            name: 'a',
            after: ['b']
          }
        );

        const pluginB = createPlugin(
          {
            hook: () => 'b'
          },
          {
            name: 'b',
            after: ['c']
          }
        );

        const pluginC = createPlugin(
          {
            hook: () => 'c'
          },
          {
            name: 'c'
          }
        );

        usePlugin(pluginA, pluginB, pluginC);
        const result = await runner.hook();
        expect(result).toStrictEqual(['c', 'b', 'a']);
      });
    });

    describe(`should work when set both 'before' and 'after'`, () => {
      test('when initial order is right', async () => {
        const hook = createSyncHook<void, void, string>();
        const group = createHookManager({ hook }, false);
        const { createPlugin, usePlugin, runner } = group;

        const pluginA = createPlugin(
          {
            hook: () => 'a'
          },
          {
            name: 'a'
          }
        );

        const pluginB = createPlugin(
          {
            hook: () => 'b'
          },
          {
            name: 'b',
            after: ['a']
          }
        );

        const pluginC = createPlugin(
          {
            hook: () => 'c'
          },
          {
            name: 'c',
            before: ['d']
          }
        );

        const pluginD = createPlugin(
          {
            hook: () => 'd'
          },
          {
            name: 'd'
          }
        );

        usePlugin(pluginA, pluginB, pluginC, pluginD);
        const result = await runner.hook();
        console.log('-----result', result);
        expect(result).toStrictEqual(['a', 'b', 'c', 'd']);
      });
      test('when initial order is wrong', async () => {
        const hook = createSyncHook<void, void, string>();
        const group = createHookManager({ hook }, false);
        const { createPlugin, usePlugin, runner } = group;

        const pluginA = createPlugin(
          {
            hook: () => 'a'
          },
          {
            name: 'a'
          }
        );

        const pluginB = createPlugin(
          {
            hook: () => 'b'
          },
          {
            name: 'b'
          }
        );

        const pluginC = createPlugin(
          {
            hook: () => 'c'
          },
          {
            name: 'c',
            after: ['d'],
            before: ['a']
          }
        );

        const pluginD = createPlugin(
          {
            hook: () => 'd'
          },
          {
            name: 'd'
          }
        );

        usePlugin(pluginA, pluginB, pluginC, pluginD);
        const result = await runner.hook();
        console.log('-----result', result);
        expect(result).toStrictEqual(['b', 'd', 'c', 'a']);
      });
    });

    test('should throw error when the order has circular dependency', async () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a',
          before: ['b']
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          before: ['a']
        }
      );

      usePlugin(pluginA, pluginB);

      expect(() => {
        runner.hook();
      }).toThrowError(
        `Plugin circular dependency detected: a, b. Please ensure the plugins have correct 'before' and 'after' property.`
      );
    });
  });

  describe(`when set 'conflict' option`, () => {
    test(`should not throw error if config is right`, async () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a'
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          conflict: ['d', 'e', 'f']
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c'
        }
      );

      usePlugin(pluginA, pluginB, pluginC);
      expect(await runner.hook()).toStrictEqual(['a', 'b', 'c']);
    });
    test(`should throw error when the plugin name is conflicted.`, () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a'
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          conflict: ['a', 'd']
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c'
        }
      );

      usePlugin(pluginA, pluginB, pluginC);
      expect(() => {
        runner.hook();
      }).toThrowError('Plugin conflict detected: b has conflict with a.');
    });
  });

  describe(`when set 'required'`, () => {
    test(`should not throw error if config is right`, async () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a'
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          required: ['a']
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c',
          required: ['b']
        }
      );

      usePlugin(pluginA, pluginB, pluginC);
      expect(await runner.hook()).toStrictEqual(['a', 'b', 'c']);
    });

    test('should throw error when the required plugin is not used', () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a'
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          required: ['a', 'd']
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c'
        }
      );

      usePlugin(pluginA, pluginB, pluginC);
      expect(() => {
        runner.hook();
      }).toThrowError('Plugin missing detected: d is required by b');
    });
  });

  describe('group', () => {
    test('should run plugin in order of group', async () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a',
          group: 1
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          group: -1
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c'
        }
      );

      usePlugin(pluginA, pluginB, pluginC);
      const result = await runner.hook();
      expect(result).toStrictEqual(['b', 'c', 'a']);
    });

    test(`'before' and 'after' options only work for same group`, async () => {
      const hook = createSyncHook<void, void, string>();
      const group = createHookManager({ hook }, false);
      const { createPlugin, usePlugin, runner } = group;

      const pluginA = createPlugin(
        {
          hook: () => 'a'
        },
        {
          name: 'a',
          group: 1
        }
      );

      const pluginB = createPlugin(
        {
          hook: () => 'b'
        },
        {
          name: 'b',
          group: -1
        }
      );

      const pluginC = createPlugin(
        {
          hook: () => 'c'
        },
        {
          name: 'c'
        }
      );

      const pluginD = createPlugin(
        {
          hook: () => 'd'
        },
        {
          name: 'd',
          before: ['b', 'c']
        }
      );

      usePlugin(pluginA, pluginB, pluginC, pluginD);
      const result = await runner.hook();
      expect(result).toStrictEqual(['b', 'd', 'c', 'a']);
    });
  });
});
