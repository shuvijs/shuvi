import { createSyncBailHook, SyncBailHookHandler } from '../../index';

describe('SyncBailHook', () => {
  test('hooks should run in sequence', () => {
    const hook = createSyncBailHook<void>();
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
    const hook = createSyncBailHook<number, number>();
    const handler: SyncBailHookHandler<number, number, void> = jest.fn(
      (i, e) => {
        expect(i).toBe(1);
        expect(e).toBe(2);
      }
    );
    hook.use(handler);
    hook.run(1, 2);
    expect(handler).toBeCalledTimes(1);
  });

  test('hook result should be the return value of the first handler that returns value', () => {
    const hook = createSyncBailHook<void, void, number>();
    const handler1 = jest.fn(() => {});
    const handler2 = jest.fn(() => 10);
    const handler3 = jest.fn(() => 20);
    hook.use(handler1);
    hook.use(handler2);
    hook.use(handler3);
    const result = hook.run();
    expect(result).toBe(10);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(0);
  });

  test('hook result should be undefined if none of the handlers returns value', () => {
    const hook = createSyncBailHook<void, void, number>();
    const handler1 = jest.fn(() => {});
    const handler2 = jest.fn(() => {});
    hook.use(handler1);
    hook.use(handler2);
    const result = hook.run();
    expect(result).toBe(undefined);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
  });
});
