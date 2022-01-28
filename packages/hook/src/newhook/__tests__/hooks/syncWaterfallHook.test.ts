import { createSyncWaterfallHook } from '../../hooks';

beforeEach(() => {});

afterEach(async () => {});

describe('syncHook', () => {
  console.log = jest.fn();
  test('not used', () => {
    const hook = createSyncWaterfallHook<number>();
    const result = hook.run(10)
    expect(result).toBe(10)
  })
  test('initialValue-void', async () => {
    const hook = createSyncWaterfallHook<void>();
    hook.use(() => {
      console.log('hook 1');
    });
    hook.use(() => {
      console.log('hook 2');
    });
    hook.run();
    expect(console.log).toHaveBeenNthCalledWith(1, 'hook 1');
    expect(console.log).toHaveBeenNthCalledWith(2, 'hook 2');
  });

  test('initialValue-normal extraArg-void', async () => {
    const hook = createSyncWaterfallHook<number, void>();
    hook.use(i => {
      return i * 2;
    });
    hook.use(i => {
      return i * 3;
    });
    const result = hook.run(10);
    expect(result).toBe(60);
  });
});
