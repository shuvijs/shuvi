import { executeAsyncSeriesHook } from '../src/AsyncSeriesHook';
import { IHookOpts } from '../src/types';
import { runHook } from './hookTestHelper';
describe('AsyncSeriesHook', () => {
  it('should have tap, tapPromise method', async () => {
    const mockTap = jest.fn();
    const mockPromiseTap = jest.fn().mockReturnValue('promise');
    const hooks: IHookOpts[] = [
      {
        name: 'somePlugin',
        fn: mockTap
      },
      {
        name: 'promise',
        fn: () => {
          return new Promise(resolve =>
            setTimeout(() => resolve(mockPromiseTap()), 100)
          );
        }
      }
    ];

    const promise = runHook(hooks, executeAsyncSeriesHook);

    expect(mockTap).toHaveBeenCalledTimes(1);
    expect(mockPromiseTap).toBeCalledTimes(0);

    const result = await promise;
    expect(mockPromiseTap).toBeCalledTimes(1);
    expect(result).toMatchObject([undefined, 'promise']);
  });

  it('should throw the same error as tap function', async () => {
    const mockTap = jest.fn();
    const hooks: IHookOpts[] = [
      {
        name: 'somePlugin',
        fn: mockTap
      },
      {
        name: 'promise',
        fn: async param => {
          expect(param).toBe(1);

          await new Promise(resolve => setTimeout(resolve, 200));
          throw new Error('error');
        }
      }
    ];

    try {
      await runHook(hooks, executeAsyncSeriesHook, 1);
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });
});
