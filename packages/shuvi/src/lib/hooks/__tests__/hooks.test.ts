import { Hooks } from '../hooks';

describe('hooks', () => {
  test('should called in serial: no initialValue', async () => {
    const hook = new Hooks();
    const arr: any[] = [];
    hook.addHook('foo', {
      name: 'a',
      fn(val: any) {
        arr.push('a', val);
        return val;
      }
    });
    hook.addHook('foo', {
      name: 'b',
      fn(val: any) {
        arr.push('b', val);
        return val;
      }
    });
    hook.addHook('foo', {
      name: 'c',
      fn(val: any) {
        arr.push('c', val);
        return val;
      }
    });

    await hook.callHook('foo', 'bar');
    expect(arr).toEqual(['a', 'bar', 'b', 'bar', 'c', 'bar']);
  });

  test('should called in serial: has initialValue', async () => {
    const hook = new Hooks();
    hook.addHook('foo', {
      name: 'a',
      fn(memo: any, p1: any) {
        memo.push('a', p1);
        return memo;
      }
    });
    hook.addHook('foo', {
      name: 'b',
      fn(memo: any, p1: any) {
        memo.push('b', p1);
        return memo;
      }
    });
    hook.addHook('foo', {
      name: 'c',
      fn(memo: any, p1: any) {
        memo.push('c', p1);
        return memo;
      }
    });

    const arr: any[] = [];
    await hook.callHook({ name: 'foo', initialValue: arr }, 'bar');
    expect(arr).toEqual(['a', 'bar', 'b', 'bar', 'c', 'bar']);
  });

  test('should called in parallel', async () => {
    const hook = new Hooks();
    hook.addHook('foo', {
      name: 'a',
      fn(p1: any) {
        return 'a' + p1;
      }
    });
    hook.addHook('foo', {
      name: 'b',
      fn(p1: any) {
        return 'b' + p1;
      }
    });
    hook.addHook('foo', {
      name: 'c',
      fn(p1: any) {
        return 'c' + p1;
      }
    });

    const res = await hook.callHook({ name: 'foo', parallel: true }, '1');
    expect(res).toEqual(['a1', 'b1', 'c1']);
  });
});
