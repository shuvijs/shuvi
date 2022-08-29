import { AsyncSeriesHookHandler, createAsyncSeriesHook } from '../../hooks';
import { sleep } from '../utils';

describe('AsyncSeriesHook', () => {
  test('hooks should run in sequence', async () => {
    const hook = createAsyncSeriesHook<void>();
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
    const hook = createAsyncSeriesHook<number, number>();
    const handler: AsyncSeriesHookHandler<number, number, void> = jest.fn(
      (i, e) => {
        expect(i).toBe(1);
        expect(e).toBe(2);
      }
    );
    hook.use(handler);
    await hook.run(1, 2);
    expect(handler).toBeCalledTimes(1);
  });

  test('result should be array', async () => {
    const hook = createAsyncSeriesHook<void, void, number | void>();
    hook.use(() => 10);
    hook.use(() => {});
    hook.use(async () => 20);
    const result = await hook.run();
    expect(result).toStrictEqual([10, undefined, 20]);
  });
});
