import { AsyncParallelHookHandler, createAsyncParallelHook } from '../../hooks';
import { sleep } from '../utils';

describe('AsyncParallelHook', () => {
  test('hooks should run in parallel', async () => {
    const hook = createAsyncParallelHook<void>();
    const logs: number[] = [];
    hook.use(async () => {
      await sleep(10);
      logs.push(1);
    });
    hook.use(async () => {
      logs.push(2);
    });
    hook.use(() => {
      logs.push(3);
    });
    await hook.run();
    expect(logs).toEqual([2, 3, 1]);
  });

  test('the params of run() should be as the params of the hook handler', async () => {
    const hook = createAsyncParallelHook<number, number>();
    const handler: AsyncParallelHookHandler<number, number, void> = jest.fn(
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
    const hook = createAsyncParallelHook<void, void, number | void>();
    hook.use(() => 10);
    hook.use(() => {});
    hook.use(async () => 20);
    const result = await hook.run();
    expect(result).toStrictEqual([10, undefined, 20]);
  });
});
