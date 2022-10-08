import { SyncHookHandler, createSyncHook } from '../../hooks';

describe('AsyncSeriesHook', () => {
  test('hooks should run in sequence', () => {
    const hook = createSyncHook<void>();
    const logs: string[] = [];
    hook.use(() => {
      logs.push('hook 1');
    });
    hook.use(() => {
      logs.push('hook 2');
    });
    hook.run();
    expect(logs).toEqual(['hook 1', 'hook 2']);
  });

  test('the params of run() should be as the params of the hook handler', () => {
    const hook = createSyncHook<number, number>();
    const handler: SyncHookHandler<number, number, void> = jest.fn((i, e) => {
      expect(i).toBe(1);
      expect(e).toBe(2);
    });
    hook.use(handler);
    hook.run(1, 2);
    expect(handler).toBeCalledTimes(1);
  });

  test('result should be array', () => {
    const hook = createSyncHook<void, void, number | void>();
    hook.use(() => 10);
    hook.use(() => {});
    hook.use(() => 20);
    const result = hook.run();
    expect(result).toStrictEqual([10, undefined, 20]);
  });

  describe('types', () => {
    test('initialValue-normal extraArg-normal', async () => {
      let initialValue: number;
      let extraArg: number;
      const hook = createSyncHook<number, number>();
      hook.use((i, e) => {
        initialValue = i;
        extraArg = e;
      });
      hook.run(10, 20);
      expect(true).toBe(true);
    });
    test('initialValue-void extraArg-normal', async () => {
      let extraArg: number;
      const hook = createSyncHook<void, number>();
      hook.use(e => {
        extraArg = e;
      });
      hook.run(10);
      expect(true).toBe(true);
    });

    test('initialValue-any extraArg-normal', async () => {
      let initialValue: any;
      let extraArg: number;
      const hook = createSyncHook<any, number>();
      hook.use((i, e) => {
        initialValue = i;
        extraArg = e;
      });
      hook.run('10', 20);
      expect(true).toBe(true);
    });

    test('initialValue-normal extraArg-void', async () => {
      let initialValue: number;
      const hook = createSyncHook<number, void>();
      hook.use(i => {
        initialValue = i;
      });
      hook.run(10);
      expect(true).toBe(true);
    });
    test('initialValue-void extraArg-void', async () => {
      const hook = createSyncHook<void, void>();
      hook.use(() => {});
      hook.run();
      expect(true).toBe(true);
    });

    test('initialValue-any extraArg-void', async () => {
      let initialValue: any;
      const hook = createSyncHook<any, void>();
      hook.use(i => {
        initialValue = i;
      });
      hook.run('test any');
      expect(true).toBe(true);
    });

    test('initialValue-normal extraArg-any', async () => {
      let initialValue: number;
      let extraArg: any;
      const hook = createSyncHook<number, any>();
      hook.use((i, e) => {
        initialValue = i;
        extraArg = e;
      });
      hook.run(10, '20');
      expect(true).toBe(true);
    });
    test('initialValue-void extraArg-any', async () => {
      let extraArg: any;
      const hook = createSyncHook<void, any>();
      hook.use(e => {
        extraArg = e;
      });
      hook.run('test any');
      expect(true).toBe(true);
    });

    test('initialValue-any extraArg-any', async () => {
      let initialValue: any;
      let extraArg: any;
      const hook = createSyncHook<any, any>();
      hook.use((i, e) => {
        initialValue = i;
        extraArg = e;
      });
      hook.run('test 1', 'test 2');
      expect(true).toBe(true);
    });
  });
});
