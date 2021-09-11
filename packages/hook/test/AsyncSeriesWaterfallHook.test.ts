import { executeAsyncSeriesWaterfallHook } from '../src/AsyncSeriesWaterfallHook';
import { IHookOpts } from '../src/types';
import { runHook } from './hookTestHelper';

describe('AsyncSeriesWaterfallHook', () => {
  it('should have tap method', async () => {
    const hooks: IHookOpts[] = [
      { name: 'somePlugin', fn: arg => Promise.resolve(arg + 1) }
    ];

    const result = await runHook(hooks, executeAsyncSeriesWaterfallHook, 42);
    expect(result).toBe(43);
  });

  it('should have promise method', async () => {
    const hooks: IHookOpts<number>[] = [
      {
        name: 'add 1',
        fn: arg => {
          expect(arg).toBe(43);
          return new Promise(resolve => {
            setTimeout(() => resolve(arg + 1), 100);
          });
        }
      },
      {
        name: 'add 2',
        fn: arg => {
          expect(arg).toBe(44);
          return new Promise(resolve => {
            setTimeout(() => resolve(arg + 2), 100);
          });
        }
      }
    ];
    const result = await runHook(hooks, executeAsyncSeriesWaterfallHook, 43);
    expect(result).toBe(46);
  });

  it('should throw error promise rejection', async done => {
    const hooks: IHookOpts[] = [
      {
        name: 'add 1',
        fn: arg => {
          expect(arg).toBe(43);
          return new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('something wrong'));
            }, 100);
          });
        }
      },
      {
        name: 'add 2',
        fn: arg => {
          expect(arg).toBe(44);
          return new Promise(resolve => {
            setTimeout(() => resolve(arg + 2), 100);
          });
        }
      }
    ];

    runHook(hooks, executeAsyncSeriesWaterfallHook, 43).catch((e: Error) => {
      expect(e.message).toBe('something wrong');
      done();
    });
  });

  it('should retain the old value when fn didnt return value', async () => {
    const hooks: IHookOpts[] = [
      {
        name: 'add 1',
        fn: obj => {
          obj.a = 1;
        }
      },
      {
        name: 'add 2',
        fn: obj => {
          obj.b = 2;
        }
      }
    ];

    const result = await runHook(hooks, executeAsyncSeriesWaterfallHook, {});
    expect(result).toMatchObject({
      a: 1,
      b: 2
    });
  });
});
