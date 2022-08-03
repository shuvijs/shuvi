import { each } from '../async';

describe('async/each', () => {
  function eachIteratee(args: any[], x: any, callback: any) {
    setTimeout(() => {
      args.push(x);
      callback();
    }, x * 25);
  }

  function eachNoCallbackIteratee(
    done: () => any,
    x: any,
    callback: () => any
  ) {
    expect(x).toEqual(1);
    callback();
    done();
  }

  it('each', done => {
    const args: any[] = [];
    each([1, 3, 2], eachIteratee.bind(this, args), err => {
      expect(err).toBeNull();
      expect(args).toEqual([1, 2, 3]);
      done();
    });
  });

  it('each extra callback', done => {
    var count = 0;
    each([1, 3, 2], (val, callback) => {
      count++;
      var done_ = count == 3;
      callback();
      callback();
      if (done_) {
        done();
      }
    });
  });

  it('each empty array', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    each(
      [],
      (x, callback) => {
        fn1();
        callback();
      },
      err => {
        if (err) throw err;
        fn2();
      }
    );
    expect(fn1).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('each empty array, with other property on the array', () => {
    const myArray: any[] = [];
    (myArray as any).myProp = 'anything';
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    each(
      myArray,
      (x, callback) => {
        fn1();
        callback();
      },
      err => {
        if (err) throw err;
        fn2();
      }
    );
    expect(fn1).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('each error', done => {
    each(
      [1, 2, 3],
      (x, callback) => {
        callback('error');
      },
      err => {
        expect(err).toEqual('error');
        done();
      }
    );
  });

  it('each no callback', done => {
    each([1], eachNoCallbackIteratee.bind(this, done));
  });
});
