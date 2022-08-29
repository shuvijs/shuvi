import {
  AsyncSeriesWaterfallHookHandler,
  createAsyncSeriesWaterfallHook
} from '../../hooks';
import { sleep } from '../utils';

describe('AsyncSeriesWaterfallHook', () => {
  test('hooks should run in sequence', async () => {
    const hook = createAsyncSeriesWaterfallHook<void>();
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
    const hook = createAsyncSeriesWaterfallHook<number, number>();
    const handler: AsyncSeriesWaterfallHookHandler<number, number> = jest.fn(
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

  test('the initial value of the hook handler should be the return value of the previous hook handler', async () => {
    const hook = createAsyncSeriesWaterfallHook<number | undefined, number>();
    const handler1: AsyncSeriesWaterfallHookHandler<
      number | undefined,
      number
    > = jest.fn((i, e) => {
      expect(i).toBe(1);
      expect(e).toBe(2);
      return undefined;
    });

    const handler2: AsyncSeriesWaterfallHookHandler<
      number | undefined,
      number
    > = jest.fn(async (i, e) => {
      expect(i).toBe(undefined);
      expect(e).toBe(2);
      return 10;
    });

    const handler3: AsyncSeriesWaterfallHookHandler<
      number | undefined,
      number
    > = jest.fn((i, e) => {
      expect(i).toBe(10);
      expect(e).toBe(2);
      return undefined;
    });

    hook.use(handler1, handler2, handler3);
    const result = await hook.run(1, 2);
    expect(result).toBeUndefined();
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });
});
