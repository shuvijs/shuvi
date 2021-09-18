import { insertHook } from '../src/utils';
import { IHookOpts } from '../src/types';

const noop = () => {};

describe('insertHook', () => {
  test('should add multiple hook and sort them based on before', () => {
    const hooks: IHookOpts[] = [];

    const firstHook: IHookOpts = {
      name: 'first',
      fn: noop
    };

    const thirdHook: IHookOpts = {
      name: 'third',
      fn: noop
    };

    const secondHook: IHookOpts = {
      name: 'second',
      fn: noop,
      before: 'third'
    };

    const beforeSecondHook = {
      name: 'beforeSecond',
      before: 'second',
      fn: noop
    };

    expect(insertHook(hooks, firstHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
        },
      ]
    `);
    expect(insertHook(hooks, thirdHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
        },
        Object {
          "fn": [Function],
          "name": "third",
        },
      ]
    `);
    expect(insertHook(hooks, secondHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
        },
        Object {
          "before": "third",
          "fn": [Function],
          "name": "second",
        },
        Object {
          "fn": [Function],
          "name": "third",
        },
      ]
    `);
    expect(insertHook(hooks, beforeSecondHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
        },
        Object {
          "before": "second",
          "fn": [Function],
          "name": "beforeSecond",
        },
        Object {
          "before": "third",
          "fn": [Function],
          "name": "second",
        },
        Object {
          "fn": [Function],
          "name": "third",
        },
      ]
    `);
  });

  test('should add multiple hook and sort them based on stage', () => {
    const hooks: IHookOpts[] = [];

    const firstHook: IHookOpts = {
      name: 'first',
      fn: noop,
      stage: 1
    };

    const thirdHook: IHookOpts = {
      name: 'third',
      fn: noop,
      stage: 4
    };

    const secondHook: IHookOpts = {
      name: 'second',
      fn: noop,
      stage: 3
    };

    const beforeSecondHook = {
      name: 'beforeSecond',
      fn: noop,
      stage: 2
    };

    expect(insertHook(hooks, firstHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
          "stage": 1,
        },
      ]
    `);
    expect(insertHook(hooks, thirdHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
          "stage": 1,
        },
        Object {
          "fn": [Function],
          "name": "third",
          "stage": 4,
        },
      ]
    `);
    expect(insertHook(hooks, secondHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
          "stage": 1,
        },
        Object {
          "fn": [Function],
          "name": "second",
          "stage": 3,
        },
        Object {
          "fn": [Function],
          "name": "third",
          "stage": 4,
        },
      ]
    `);
    expect(insertHook(hooks, beforeSecondHook)).toMatchInlineSnapshot(`
      Array [
        Object {
          "fn": [Function],
          "name": "first",
          "stage": 1,
        },
        Object {
          "fn": [Function],
          "name": "beforeSecond",
          "stage": 2,
        },
        Object {
          "fn": [Function],
          "name": "second",
          "stage": 3,
        },
        Object {
          "fn": [Function],
          "name": "third",
          "stage": 4,
        },
      ]
    `);
  });
});
