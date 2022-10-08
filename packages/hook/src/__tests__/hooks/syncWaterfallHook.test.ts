import { SyncWaterfallHookHandler, createSyncWaterfallHook } from '../../hooks';

describe('SyncWaterfallHook', () => {
  test('hooks should run in sequence', () => {
    const hook = createSyncWaterfallHook<void>();
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

  test('the params of run() should be as the params of the hook handler', async () => {
    const hook = createSyncWaterfallHook<number, number>();
    const handler: SyncWaterfallHookHandler<number, number> = jest.fn(
      (i, e) => {
        expect(i).toBe(1);
        expect(e).toBe(2);
        return i + e;
      }
    );
    hook.use(handler);
    await hook.run(1, 2);
    expect(handler).toBeCalledTimes(1);
  });

  test('the initial value of the hook handler should be the return value of the previous hook handler', () => {
    const hook = createSyncWaterfallHook<number, number>();
    const handler1: SyncWaterfallHookHandler<number, number> = jest.fn(
      (i, e) => {
        expect(i).toBe(1);
        expect(e).toBe(2);
        return 5;
      }
    );

    const handler2: SyncWaterfallHookHandler<number, number> = jest.fn(
      (i, e) => {
        expect(i).toBe(5);
        expect(e).toBe(2);
        return 10;
      }
    );

    const handler3: SyncWaterfallHookHandler<number, number> = jest.fn(
      (i, e) => {
        expect(i).toBe(10);
        expect(e).toBe(2);
        return 8;
      }
    );

    hook.use(handler1, handler2, handler3);
    const result = hook.run(1, 2);
    expect(result).toBe(8);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });

  test('handlers that return undefined should execute but the result should be discarded', () => {
    const hook = createSyncWaterfallHook<number | undefined, number>();
    const handler1: SyncWaterfallHookHandler<number | undefined, number> =
      jest.fn((i, e) => {
        expect(i).toBe(1);
        expect(e).toBe(2);
        return undefined;
      });

    const handler2: SyncWaterfallHookHandler<number | undefined, number> =
      jest.fn((i, e) => {
        expect(i).toBe(1);
        expect(e).toBe(2);
        return 10;
      });

    const handler3: SyncWaterfallHookHandler<number | undefined, number> =
      jest.fn((i, e) => {
        expect(i).toBe(10);
        expect(e).toBe(2);
        return undefined;
      });

    hook.use(handler1, handler2, handler3);
    const result = hook.run(1, 2);
    expect(result).toBe(10);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });
});
