import { createAsyncSeriesWaterfallHook } from '../../hooks';

beforeEach(() => {});

afterEach(async () => {});

describe('syncHook', () => {
  console.log = jest.fn();
  test('initialValue-void', async () => {
    const hook = createAsyncSeriesWaterfallHook<void>();
    hook.use(() => {
      console.log('hook 1');
    });
    hook.use(() => {
      console.log('hook 2');
    });
    hook.use(async () => {
      console.log('hook 3');
    });
    await hook.run();
    expect(console.log).toHaveBeenNthCalledWith(1, 'hook 1');
    expect(console.log).toHaveBeenNthCalledWith(2, 'hook 2');
    expect(console.log).toHaveBeenNthCalledWith(3, 'hook 3');
  });

  test('initialValue-normal extraArg-void', async () => {
    const hook = createAsyncSeriesWaterfallHook<number, void>();
    hook.use(async i => {
      return i * 2;
    });
    hook.use(i => {
      return i * 3;
    });
    const result = await hook.run(10);
    expect(result).toBe(60);
  });
});
