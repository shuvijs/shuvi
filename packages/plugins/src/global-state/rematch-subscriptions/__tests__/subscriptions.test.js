import { init } from '@rematch/core';
import subscriptionsPlugin from '../index';

const common = {
  state: 0,
  reducers: {
    addOne: state => state + 1
  }
};

describe('subscriptions:', () => {
  it('should create a working subscription', () => {
    const first = {
      ...common,
      _subscriptions: {
        'second/addOne'() {
          this.addOne();
        }
      }
    };
    const second = common;
    const store = init({
      models: { first, second },
      plugins: [subscriptionsPlugin()]
    });

    store.dispatch.second.addOne();

    expect(store.getState()).toEqual({
      second: 1,
      first: 1
    });
  });

  it('should allow for two subscriptions with same name in different models', () => {
    const a1 = {
      ...common,
      _subscriptions: {
        'b1/addOne'() {
          this.addOne();
        }
      }
    };
    const b1 = common;
    const c1 = {
      ...common,
      _subscriptions: {
        'b1/addOne'() {
          this.addOne();
        }
      }
    };
    const store = init({
      models: { a1, b1, c1 },
      plugins: [subscriptionsPlugin()]
    });

    store.dispatch.b1.addOne();

    expect(store.getState()).toEqual({
      a1: 1,
      b1: 1,
      c1: 1
    });
  });

  it('should allow for three subscriptions with same name in different models', () => {
    const a = {
      ...common,
      _subscriptions: {
        'b/addOne'() {
          this.addOne();
        }
      }
    };
    const b = common;
    const c = {
      ...common,
      _subscriptions: {
        'b/addOne'() {
          this.addOne();
        }
      }
    };
    const d = {
      ...common,
      _subscriptions: {
        'b/addOne'() {
          this.addOne();
        }
      }
    };
    // no subscriptions, superfluous model
    // just an additional check to see that
    // other models are not effected
    const e = common;
    const store = init({
      models: {
        a,
        b,
        c,
        d,
        e
      },
      plugins: [subscriptionsPlugin()]
    });

    store.dispatch.b.addOne();

    expect(store.getState()).toEqual({
      a: 1,
      b: 1,
      c: 1,
      d: 1,
      e: 0
    });
  });

  it('should throw if a subscription matcher is invalid', () => {
    const store = init({
      plugins: [subscriptionsPlugin()]
    });

    expect(() =>
      store.model({
        name: 'first',
        ...common,
        _subscriptions: {
          'Not/A/Valid/Matcher': () => store.dispatch.first.addOne()
        }
      })
    ).toThrow();
  });

  it('should enforce subscriptions are functions', () => {
    const store = init({
      plugins: [subscriptionsPlugin()]
    });

    expect(() =>
      store.model({
        name: 'first',
        ...common,
        _subscriptions: {
          'valid/matcher': 42
        }
      })
    ).toThrow();
  });

  describe('pattern matching', () => {
    it('should create working pattern matching subscription (second/*)', () => {
      const first = {
        ...common,
        _subscriptions: {
          'second/*'() {
            this.addOne();
          }
        }
      };
      const second = common;
      const store = init({
        models: { first, second },
        plugins: [subscriptionsPlugin()]
      });

      store.dispatch.second.addOne();

      expect(store.getState()).toEqual({
        second: 1,
        first: 1
      });
    });

    it('should create working pattern matching subsription (*/addOne)', () => {
      const first = {
        ...common,
        _subscriptions: {
          '*/add'() {
            this.addOne();
          }
        }
      };
      const second = {
        state: 0,
        reducers: {
          add: (state, payload) => state + payload
        }
      };
      const store = init({
        models: { first, second },
        plugins: [subscriptionsPlugin()]
      });

      store.dispatch.second.add(2);

      expect(store.getState()).toEqual({
        second: 2,
        first: 1
      });
    });

    it('should create working pattern matching subscription (second/add*)', () => {
      const first = {
        ...common,
        _subscriptions: {
          'second/add*'() {
            this.addOne();
          }
        }
      };
      const second = common;
      const store = init({
        models: { first, second },
        plugins: [subscriptionsPlugin()]
      });

      store.dispatch.second.addOne();

      expect(store.getState()).toEqual({
        second: 1,
        first: 1
      });
    });

    it('should throw an error if a user creates a subscription that matches a reducer in the model', () => {
      const store = init({
        plugins: [subscriptionsPlugin()]
      });

      const createModel = () =>
        store.model({
          name: 'first',
          state: 0,
          reducers: {
            addOne: state => state + 1
          },
          _subscriptions: {
            'first/addOne'() {
              console.log('anything');
            }
          }
        });

      expect(createModel).toThrow();
    });

    it('should throw an error if a user creates a subscription that matches an effect in the model', () => {
      const store = init({
        plugins: [subscriptionsPlugin()]
      });

      const createModel = () =>
        store.model({
          name: 'first',
          state: 0,
          effects: {
            sayHi: () => console.log('hi')
          },
          _subscriptions: {
            'first/sayHi'() {
              console.log('anything');
            }
          }
        });

      expect(createModel).toThrow();
    });

    it('should throw an error if a user creates a subscription that pattern matches a reducer in the model', () => {
      const store = init({
        plugins: [subscriptionsPlugin()]
      });

      const createModel = () =>
        store.model({
          name: 'first',
          state: 0,
          reducers: {
            addOne: state => state + 1
          },
          _subscriptions: {
            '*/addOne'() {
              console.log('anything');
            }
          }
        });

      expect(createModel).toThrow();
    });
  });

  it('should have access to state from second param', () => {
    const first = {
      state: 3,
      reducers: {
        addBy: (state, payload) => state + payload
      },
      _subscriptions: {
        'second/addOne'(action, state) {
          this.addBy(state.first);
        }
      }
    };
    const second = {
      ...common
    };
    const store = init({
      models: { first, second },
      plugins: [subscriptionsPlugin()]
    });

    store.dispatch.second.addOne();

    expect(store.getState()).toEqual({
      second: 1,
      first: 6
    });
  });

  describe('unsubscribe:', () => {
    it('a matched action', () => {
      const { createUnsubscribe } = require('../src/unsubscribe');
      const first = {
        ...common,
        _subscriptions: {
          'second/addOne'() {
            this.addOne();
          }
        }
      };
      const second = {
        ...common
      };
      const store = init({
        models: { first, second },
        plugins: [subscriptionsPlugin()]
      });
      const unsubscribe = createUnsubscribe('first', 'second/addOne');
      unsubscribe();
      store.dispatch.second.addOne();

      expect(store.getState()).toEqual({
        second: 1,
        first: 0
      });
    });
    it('a pattern matched action', () => {
      const { createUnsubscribe } = require('../src/unsubscribe');
      const first = {
        ...common,
        _subscriptions: {
          'second/*'() {
            this.addOne();
          }
        }
      };
      const second = {
        ...common
      };
      const store = init({
        models: { first, second },
        plugins: [subscriptionsPlugin()]
      });

      const unsubscribe = createUnsubscribe('first', 'second/*');
      unsubscribe();
      store.dispatch.second.addOne();

      expect(store.getState()).toEqual({
        second: 1,
        first: 0
      });
    });
    it('a pattern matched action when more than one', () => {
      const { createUnsubscribe } = require('../src/unsubscribe');
      const first = {
        ...common,
        _subscriptions: {
          'second/*'() {
            this.addOne();
          }
        }
      };
      const second = {
        ...common
      };
      const third = {
        ...common,
        _subscriptions: {
          'second/*'() {
            this.addOne();
          }
        }
      };
      const store = init({
        models: { first, second, third },
        plugins: [subscriptionsPlugin()]
      });
      const unsubscribe = createUnsubscribe('first', 'second/*');
      unsubscribe();
      store.dispatch.second.addOne();

      expect(store.getState()).toEqual({
        first: 0,
        second: 1,
        third: 1
      });
    });
    it('should throw if invalid action', () => {
      const { createUnsubscribe } = require('../src/unsubscribe');
      const first = {
        ...common,
        _subscriptions: {
          'second/addOne'() {
            this.addOne();
          }
        }
      };
      init({
        models: { first },
        plugins: [subscriptionsPlugin()]
      });

      const unsubscribe = createUnsubscribe('first', 'an/invalid/action');

      expect(unsubscribe).toThrow();
    });
    it('should do nothing if no action', () => {
      const { createUnsubscribe } = require('../src/unsubscribe');
      const first = {
        ...common,
        _subscriptions: {
          'second/addOne'() {
            this.addOne();
          }
        }
      };
      const second = common;
      const store = init({
        models: { first, second },
        plugins: [subscriptionsPlugin()]
      });

      const unsubscribe = createUnsubscribe('first', 'not/existing');
      unsubscribe();
      store.dispatch.second.addOne();

      expect(store.getState()).toEqual({
        second: 1,
        first: 1
      });
    });

    it('should allow unsubscribe within a model', () => {
      const first = {
        ...common,
        _subscriptions: {
          'second/addOne'(action, exposed, unsubscribe) {
            this.addOne();
            unsubscribe();
          }
        }
      };
      const second = common;
      const store = init({
        models: { first, second },
        plugins: [subscriptionsPlugin()]
      });

      store.dispatch.second.addOne();
      store.dispatch.second.addOne();
      store.dispatch.second.addOne();

      expect(store.getState()).toEqual({
        second: 3,
        first: 1
      });
    });

    it('should allow unsubscribe within a model with a pattern match', () => {
      const first = {
        ...common,
        _subscriptions: {
          'other/*'(action, exposed, unsubscribe) {
            this.addOne();
            unsubscribe();
          }
        }
      };
      const other = common;
      const store = init({
        models: { first, other },
        plugins: [subscriptionsPlugin()]
      });

      store.dispatch.other.addOne();
      store.dispatch.other.addOne();
      store.dispatch.other.addOne();

      expect(store.getState()).toEqual({
        other: 3,
        first: 1
      });
    });
  });
});
