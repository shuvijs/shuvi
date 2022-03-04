import { createAsyncParallelHook } from '../../hooks';

beforeEach(() => {
  console.log = jest.fn();
});

afterEach(async () => {});

describe('syncHook', () => {
  test('initialValue-normal extraArg-normal', async () => {
    const hook = createAsyncParallelHook<number, number>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.use(async (i, e) => {
      console.log(i * 2, e * 2);
    });
    await hook.run(10, 20);
    expect(console.log).toHaveBeenNthCalledWith(1, 10, 20);
    expect(console.log).toHaveBeenNthCalledWith(2, 20, 40);
  });
  test('initialValue-void extraArg-normal', async () => {
    const hook = createAsyncParallelHook<void, number>();
    hook.use(e => {
      console.log(e);
    });
    hook.use(async e => {
      console.log(e * 2);
    });
    await hook.run(10);
    expect(console.log).toHaveBeenNthCalledWith(1, 10);
    expect(console.log).toHaveBeenNthCalledWith(2, 20);
  });

  test('initialValue-any extraArg-normal', async () => {
    const hook = createAsyncParallelHook<any, number>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.use(async (i, e) => {
      console.log(i + '0', e * 2);
    });
    await hook.run('10', 20);
    expect(console.log).toHaveBeenNthCalledWith(1, '10', 20);
    expect(console.log).toHaveBeenNthCalledWith(2, '100', 40);
  });

  test('initialValue-normal extraArg-void', async () => {
    const hook = createAsyncParallelHook<number, void>();
    hook.use(i => {
      console.log(i);
    });
    hook.use(async i => {
      console.log(i * 2);
    });
    await hook.run(10);
    expect(console.log).toHaveBeenNthCalledWith(1, 10);
    expect(console.log).toHaveBeenNthCalledWith(2, 20);
  });
  test('initialValue-void extraArg-void', async () => {
    const hook = createAsyncParallelHook<void, void>();
    hook.use(() => {
      console.log('test1');
    });
    hook.use(async () => {
      console.log('test2');
    });
    await hook.run();
    expect(console.log).toHaveBeenNthCalledWith(1, 'test1');
    expect(console.log).toHaveBeenNthCalledWith(2, 'test2');
  });

  test('initialValue-any extraArg-void', async () => {
    const hook = createAsyncParallelHook<any, void>();
    hook.use(i => {
      console.log(i);
    });
    hook.use(async i => {
      console.log(i + ' async');
    });
    await hook.run('test any');
    expect(console.log).toHaveBeenNthCalledWith(1, 'test any');
    expect(console.log).toHaveBeenNthCalledWith(2, 'test any async');
  });

  test('initialValue-normal extraArg-any', async () => {
    const hook = createAsyncParallelHook<number, any>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.use(async (i, e) => {
      console.log(i * 2, e + '0');
    });
    await hook.run(10, '20');
    expect(console.log).toHaveBeenNthCalledWith(1, 10, '20');
    expect(console.log).toHaveBeenNthCalledWith(2, 20, '200');
  });
  test('initialValue-void extraArg-any', async () => {
    const hook = createAsyncParallelHook<void, any>();
    hook.use(() => {
      console.log('test any');
    });
    hook.use(async () => {
      console.log('test any' + ' async');
    });
    await hook.run('test any');
    expect(console.log).toHaveBeenNthCalledWith(1, 'test any');
    expect(console.log).toHaveBeenNthCalledWith(2, 'test any async');
  });

  test('initialValue-any extraArg-any', async () => {
    const hook = createAsyncParallelHook<any, any>();
    hook.use((i, e) => {
      console.log(i, e);
    });
    hook.use((i, e) => {
      console.log(i + ' async', e + ' async');
    });
    await hook.run('test 1', 'test 2');
    expect(console.log).toHaveBeenNthCalledWith(1, 'test 1', 'test 2');
    expect(console.log).toHaveBeenNthCalledWith(
      2,
      'test 1 async',
      'test 2 async'
    );
  });

  test('with return value', async () => {
    const hook = createAsyncParallelHook<void, void, number>();
    hook.use(() => 10);
    hook.use(async () => 20);
    const result = await hook.run();
    expect(result).toStrictEqual([10, 20]);
  });
});
