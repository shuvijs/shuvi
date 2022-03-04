import { createSyncBailHook } from '../../index';

beforeEach(() => {});

afterEach(async () => {});

describe('syncBailHook', () => {
  console.log = jest.fn();
  test('order', async () => {
    const hook = createSyncBailHook<void>();
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

  test('with initialValue', async () => {
    const hook = createSyncBailHook<number>();
    hook.use(e => {
      console.log(e);
    });
    hook.run(10);
    expect(console.log).toHaveBeenCalledWith(10);
  });
  test('with extraArg', async () => {
    const hook = createSyncBailHook<void, number>();
    hook.use(e => {
      console.log(e);
    });
    hook.run(10);
    expect(console.log).toHaveBeenCalledWith(10);
  });

  test('with initialValue and extraArg', async () => {
    const hook = createSyncBailHook<number, number>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.run(10, 20);
    expect(console.log).toHaveBeenCalledWith(10, 20);
  });

  test('with return value', async () => {
    const hook = createSyncBailHook<void, void, number>();
    hook.use(() => {});
    hook.use(() => 10);
    hook.use(() => 20);
    const result = hook.run();
    expect(result).toStrictEqual(10);
  });
});
