import { executeAsyncParallelHook } from '../src/AsyncParallelHook';
import { IHookOpts } from '../src/types';
import { runHook } from './hookTestHelper';

describe('AsyncParallelHook', () => {
  it('should pass all values', async () => {
    const hooks: IHookOpts<number>[] = [
      {
        name: 'addition',
        fn: (num1, num2) => {
          return new Promise(resolve =>
            setTimeout(resolve.bind(null, num1 + num2), 100)
          );
        }
      },
      {
        name: 'substraction',
        fn: (num1, num2) => {
          return new Promise(resolve => {
            setTimeout(() => resolve(num1 - num2), 100);
          });
        }
      }
    ];
    const args = [42, 41];
    const result = await runHook(hooks, executeAsyncParallelHook, ...args);
    expect(result).toMatchObject([83, 1]);
  });

  it('should throw error', async () => {
    const hooks: IHookOpts<number>[] = [
      {
        name: 'add 1',
        fn: arg => {
          return arg + 1;
        }
      },
      {
        name: 'add 2',
        fn: arg => {
          return arg + 2;
        }
      },
      {
        name: 'throw error',
        fn: _ => {
          throw new Error('error');
        }
      }
    ];

    try {
      const args = [42];
      await runHook(hooks, executeAsyncParallelHook, ...args);
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });

  it('should throw error promise', async () => {
    const hooks: IHookOpts<number>[] = [
      {
        name: 'addition',
        fn: (num1, num2) => {
          return new Promise(resolve =>
            setTimeout(() => resolve(num1 + num2), 100)
          );
        }
      },
      {
        name: 'substraction',
        fn: (num1, num2) => {
          return new Promise(resolve => {
            setTimeout(() => resolve(num1 - num2), 100);
          });
        }
      },
      {
        name: 'throw error',
        fn: () => {
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('error')), 100);
          });
        }
      }
    ];

    try {
      await runHook(hooks, executeAsyncParallelHook, 42, 41);
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });
});
