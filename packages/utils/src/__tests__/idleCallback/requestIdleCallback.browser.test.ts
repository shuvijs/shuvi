/**
 * @jest-environment jsdom
 */

describe('browser requestIdleCallback and cancelIdleCallback polyfill', () => {
  let originalWindow: typeof window;

  beforeAll(() => {
    // Save the original window object
    originalWindow = global.window;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window object for a browser environment
    global.window = {} as unknown as typeof originalWindow;
  });

  afterEach(() => {
    // Clear all mocks and restore original window object after each test
    jest.clearAllMocks();
    global.window = originalWindow;
  });

  test('should use window.requestIdleCallback if available', async () => {
    expect.assertions(1);

    await jest.isolateModulesAsync(async () => {
      global.window.requestIdleCallback = jest.fn();
      const callback = jest.fn();
      const { requestIdleCallback } = await import('../../idleCallback');
      requestIdleCallback(callback);
      expect(global.window.requestIdleCallback).toHaveBeenCalledWith(callback);
    });
  });

  test('should fall back to polyfill if window.requestIdleCallback is unavailable', async () => {
    expect.assertions(3);

    // @ts-expect-error test purpose
    global.window.requestIdleCallback = undefined;
    expect(global.window.requestIdleCallback).toBeUndefined();

    const callback = jest.fn();
    const timeout = 3000;

    // Mock setTimeout to control its behavior
    jest.useFakeTimers();

    await jest.isolateModulesAsync(async () => {
      const { requestIdleCallback } = await import('../../idleCallback');
      requestIdleCallback(callback);
      jest.advanceTimersByTime(timeout);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          didTimeout: false,
          timeRemaining: expect.any(Function)
        })
      );
      // execute timeRemaining function
      expect(callback.mock.calls[0][0].timeRemaining()).toBe(50);

      jest.useRealTimers();
    });
  });

  test('cancelIdleCallback should use window.cancelIdleCallback if available', async () => {
    global.window.cancelIdleCallback = jest.fn();

    const id = 123;

    await jest.isolateModulesAsync(async () => {
      const { cancelIdleCallback } = await import('../../idleCallback');
      cancelIdleCallback(id);
      expect(global.window.cancelIdleCallback).toHaveBeenCalledWith(id);
    });
  });

  test('should fall back to clearTimeout if window.cancelIdleCallback is unavailable', async () => {
    expect.assertions(2);

    // @ts-expect-error test purpose
    global.window.cancelIdleCallback = undefined;
    expect(global.window.cancelIdleCallback).toBeUndefined();

    // Mock clearTimeout to test the polyfill
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const id = setTimeout(() => {}, 0) as unknown as number;

    await jest.isolateModulesAsync(async () => {
      const { cancelIdleCallback } = await import('../../idleCallback');
      cancelIdleCallback(id);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(id);
    });
  });
});
