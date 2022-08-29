import {
  createAsyncSeriesBailHook,
  AsyncSeriesBailHookHandler
} from '../../index';
import { sleep } from '../utils';

describe('AsyncSeriesBailHook', () => {
  test('hooks should run in sequence', async () => {
    const hook = createAsyncSeriesBailHook<void>();
    const logs: string[] = [];
    hook.use(async () => {
      await sleep(10);
      logs.push('hook 1');
    });
    hook.use(() => {
      logs.push('hook 2');
    });
    await hook.run();
    expect(logs).toEqual(['hook 1', 'hook 2']);
  });

  test('the params of run() should be as the params of the hook handler', async () => {
    const hook = createAsyncSeriesBailHook<number, number>();
    const handler: AsyncSeriesBailHookHandler<number, number, void> = jest.fn(
      (i, e) => {
        expect(i).toBe(1);
        expect(e).toBe(2);
      }
    );
    hook.use(handler);
    await hook.run(1, 2);
    expect(handler).toBeCalledTimes(1);
  });

  test('hook result should be the return value of the first handler that returns value', async () => {
    const hook = createAsyncSeriesBailHook<void, void, number>();
    const handler1 = jest.fn(() => {});
    const handler2 = jest.fn(async () => 10);
    const handler3 = jest.fn(async () => 20);
    hook.use(handler1);
    hook.use(handler2);
    hook.use(handler3);
    const result = await hook.run();
    expect(result).toBe(10);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(0);
  });

  test('hook result should be undefined if none of the handlers returns value', async () => {
    const hook = createAsyncSeriesBailHook<void, void, number>();
    const handler1 = jest.fn(() => {});
    const handler2 = jest.fn(async () => {});
    hook.use(handler1);
    hook.use(handler2);
    const result = await hook.run();
    expect(result).toBe(undefined);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
  });
});
