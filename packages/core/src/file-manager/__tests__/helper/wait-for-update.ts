// @ts-nocheck
import { nextTick } from '../../scheduler';

// helper for async assertions.
// Use like this:
//
// vm.a = 123
// waitForUpdate(() => {
//   expect(vm.$el.textContent).toBe('123')
//   vm.a = 234
// })
// .then(() => {
//   // more assertions...
// })
// .then(done)
export const waitForUpdate = initialCb => {
  let end;
  const queue = initialCb ? [initialCb] : [];
  let resolve;
  const promise = new Promise(r => (resolve = r));

  async function shift() {
    const job = queue.shift();
    if (queue.length) {
      let hasError = false;
      try {
        await job();
      } catch (e) {
        hasError = true;
        const done = queue[queue.length - 1];
        if (done && done.fail) {
          done.fail(e);
        }
      }
      if (!hasError && !job.wait) {
        if (queue.length) {
          nextTick(shift);
        }
      }
    } else if (job && (job.fail || job === end)) {
      job(); // done
    }
  }

  nextTick(() => {
    if (!queue.length || (!end && !queue[queue.length - 1].fail)) {
      throw new Error('waitForUpdate chain is missing .then(done)');
    }
    shift();
  });

  const chainer = {
    then: nextCb => {
      queue.push(nextCb);
      return chainer;
    },
    thenWaitFor: wait => {
      if (typeof wait === 'number') {
        wait = timeout(wait);
      }
      wait.wait = true;
      queue.push(wait);
      return chainer;
    },
    end: endFn => {
      queue.push(endFn);
      end = endFn;
    },
    endPromise: () => {
      const endFn = () => {
        resolve();
      };
      queue.push(endFn);
      end = endFn;
      return promise;
    }
  };

  return chainer;
};

function timeout(n) {
  return next => setTimeout(next, n);
}
