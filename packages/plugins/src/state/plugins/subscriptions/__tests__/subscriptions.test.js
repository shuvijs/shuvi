import { init } from '../../../rematch';
import subscriptionsPlugin from '../index';

describe('subscriptions:', () => {
  it('should create a working subscription', () => {
    let firstCount = 0;
    const first = {
      name: 'first',
      state: 0,
      reducers: {
        addOne: state => state + 1
      },
      _subscriptions: {
        'first/*'() {
          firstCount++;
        }
      }
    };
    let secondCount = 0;
    const second = {
      name: 'second',
      state: 0,
      reducers: {
        addOne: state => state + 1
      },
      _subscriptions: {
        'second/addOne'(unsubscribe) {
          secondCount++;
          unsubscribe();
        }
      }
    };
    const store = init({
      models: { first, second },
      plugins: [subscriptionsPlugin()]
    });

    store.dispatch.first.addOne();
    expect(firstCount).toBe(1);
    store.dispatch.first.addOne();
    expect(firstCount).toBe(2);
    expect(store.getState().first).toBe(2);

    store.dispatch.second.addOne();
    expect(secondCount).toBe(1);
    store.dispatch.second.addOne();
    expect(secondCount).toBe(1);
    expect(store.getState().second).toBe(2);
  });
});
