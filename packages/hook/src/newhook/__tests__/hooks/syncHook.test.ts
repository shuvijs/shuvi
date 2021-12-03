import { createSyncHook } from '../../hooks';

beforeEach(() => {});

afterEach(async () => {});

describe('syncHook', () => {
  console.log = jest.fn();
  test('order', async () => {
    const hook = createSyncHook<void>();
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

  test('initialValue-normal extraArg-normal', async () => {
    const hook = createSyncHook<number, number>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.run(10, 20);
    expect(console.log).toHaveBeenCalledWith(10, 20);
  });
  test('initialValue-void extraArg-normal', async () => {
    const hook = createSyncHook<void, number>();
    hook.use(e => {
      console.log(e);
    });
    hook.run(10);
    expect(console.log).toHaveBeenCalledWith(10);
  });

  test('initialValue-any extraArg-normal', async () => {
    const hook = createSyncHook<any, number>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.run('10', 20);
    expect(console.log).toHaveBeenCalledWith('10', 20);
  });

  test('initialValue-normal extraArg-void', async () => {
    const hook = createSyncHook<number, void>();
    hook.use(i => {
      console.log(i);
    });
    hook.run(10);
    expect(console.log).toHaveBeenCalledWith(10);
  });
  test('initialValue-void extraArg-void', async () => {
    const hook = createSyncHook<void, void>();
    hook.use(() => {
      console.log('test');
    });
    hook.run();
    expect(console.log).toHaveBeenCalledWith('test');
  });

  test('initialValue-any extraArg-void', async () => {
    const hook = createSyncHook<any, void>();
    hook.use(i => {
      console.log(i);
    });
    hook.run('test any');
    expect(console.log).toHaveBeenCalledWith('test any');
  });

  test('initialValue-normal extraArg-any', async () => {
    const hook = createSyncHook<number, any>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.run(10, '20');
    expect(console.log).toHaveBeenCalledWith(10, '20');
  });
  test('initialValue-void extraArg-any', async () => {
    const hook = createSyncHook<void, any>();
    hook.use(() => {
      console.log('test any');
    });
    hook.run('test any');
    expect(console.log).toHaveBeenCalledWith('test');
  });

  test('initialValue-any extraArg-any', async () => {
    const hook = createSyncHook<any, any>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.run('test 1', 'test 2');
    expect(console.log).toHaveBeenCalledWith('test 1', 'test 2');
  });

  test('with return value', async () => {
    const hook = createSyncHook<void, void, number>();
    hook.use(() => 10);
    hook.use(() => 20);
    const result = hook.run();
    expect(result).toStrictEqual([10, 20]);
  });
});
