import { executeAsyncSeriesBailHook } from '../src/AsyncSeriesBailHook';
import { IHookOpts } from '../src/types';
import { runHook } from './hookTestHelper';
describe('AsyncSeriesBailHook', () => {
  it('should call promise method', async () => {
    const mockTap = jest.fn();
    const hooks: IHookOpts[] = [
      {
        name: 'somePlugin',
        fn: mockTap
      }
    ];

    const result = await runHook(hooks, executeAsyncSeriesBailHook);
    expect(result).toBe(undefined);
    expect(mockTap).toHaveBeenCalledTimes(1);
  });

  it('should bail when a tap return value', async () => {
    const mockShouldRunTap = jest.fn().mockReturnValue('nice');
    const mockNeverRunTap = jest.fn();
    const hooks: IHookOpts[] = [
      {
        name: 'should run',
        fn: mockShouldRunTap
      },
      { name: 'should never run', fn: mockNeverRunTap }
    ];
    const result = await runHook(hooks, executeAsyncSeriesBailHook);
    expect(result).toBe('nice');

    expect(mockShouldRunTap).toHaveBeenCalledTimes(1);
    expect(mockNeverRunTap).toHaveBeenCalledTimes(0);
  });

  it('should bail when a tap return value', async () => {
    const runMockFn = jest.fn();
    const dontRunMockFn = jest.fn();
    const hooks: IHookOpts<string>[] = [
      {
        name: 'should run',
        fn: runMockFn
      },
      {
        name: 'should run2',
        fn: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'stop';
        }
      },
      {
        name: 'should never run',
        fn: dontRunMockFn
      }
    ];
    const result = await runHook(hooks, executeAsyncSeriesBailHook);
    expect(result).toBe('stop');
    expect(runMockFn).toBeCalledTimes(1);
    expect(dontRunMockFn).toBeCalledTimes(0);
  });
});
