import { deepmerge } from '../deepmerge';

describe('deepmerge', () => {
  describe('with same object', () => {
    test('should work', () => {
      const mergeObject = { a: { b: 2 } };
      const result = deepmerge({ a: { c: 3 }, b: 2, c: 3 }, mergeObject);

      expect(result).toEqual({ a: { b: 2, c: 3 }, b: 2, c: 3 });
    });

    test('should work with empty object', () => {
      const result = deepmerge({ a: { b: { c: 2 } } }, {});

      expect(result).toEqual({ a: { b: { c: 2 } } });
    });

    test('should work with number', () => {
      const result = deepmerge({ a: { b: { c: 3 } } }, { a: { b: { c: 10 } } });
      expect(result).toEqual({ a: { b: { c: 10 } } });
    });

    test('should work with string', () => {
      const result = deepmerge(
        { a: { b: { c: { d: 'some string' } } }, b: { a: { d: true } } },
        { a: { b: { c: { d: 'change string' } } } }
      );
      expect(result).toEqual({
        a: { b: { c: { d: 'change string' } } },
        b: { a: { d: true } }
      });
    });

    test('should work with array', () => {
      const result = deepmerge(
        { a: { b: { c: ['a', 'b', 'c'] } } },
        { a: { b: { c: ['abc'] } } }
      );
      expect(result).toEqual({ a: { b: { c: ['abc'] } } });
    });
  });

  describe('with different object', () => {
    test('should work, object with number', () => {
      const result = deepmerge({ a: { a: 1, b: 2 }, b: 2, c: 3 }, { a: 10 });

      expect(result).toEqual({ a: 10, b: 2, c: 3 });
    });

    test('should work, object with array', () => {
      const result = deepmerge(
        { a: { a: 1, b: 2 }, b: 2, c: 3 },
        { a: ['12'] }
      );

      expect(result).toEqual({ a: ['12'], b: 2, c: 3 });
    });

    test('should work, array with object', () => {
      const result = deepmerge(
        { a: { b: { c: 123 } } },
        { a: { b: ['123'] }, c: 2 }
      );

      expect(result).toEqual({ a: { b: ['123'] }, c: 2 });
    });
  });

  describe('with recursive object', () => {
    test('should work', () => {
      let object: any = { a: { b: null } };
      object.a.b = object.a;

      const result = deepmerge(object, { a: { b: { c: true } } });

      expect(result.a.b.b).toBeTruthy();
      expect(result.a.b.c).toBe(true);
      expect(result.a.b.b.c).toBe(true);
    });
  });

  test('should not mutate the input object', () => {
    const origin = { a: { c: 3 }, b: 2, c: 3 };
    const target = { a: { b: 2 } };
    const result = deepmerge(origin, target);

    expect(result).toEqual({ a: { b: 2, c: 3 }, b: 2, c: 3 });
    expect(origin).toEqual({ a: { c: 3 }, b: 2, c: 3 });
    expect(target).toEqual({ a: { b: 2 } });
  });
});
