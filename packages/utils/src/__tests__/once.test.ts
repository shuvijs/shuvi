import { once } from '../once';

describe('once', () => {
  test('should only run once', () => {
    const fn = jest.fn().mockReturnValue(true);
    const fnOnce = once(fn);

    expect(fnOnce()).toBe(true);
    expect(fnOnce()).toBe(true);
    expect(fnOnce()).toBe(true);
    expect(fnOnce()).toBe(true);

    expect(fn).toBeCalledTimes(1);
  });
});
