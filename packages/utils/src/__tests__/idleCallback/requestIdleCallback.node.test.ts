/**
 * @jest-environment node
 */

describe('node requestIdleCallback and cancelIdleCallback polyfill', () => {
  test('requestIdleCallback should invoke callback immediately on server', async () => {
    expect.assertions(3);
    expect(global.requestIdleCallback).toBeUndefined();

    const callback = jest.fn();

    await jest.isolateModulesAsync(async () => {
      const { requestIdleCallback } = await import('../../idleCallback');
      requestIdleCallback(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          didTimeout: false,
          timeRemaining: expect.any(Function)
        })
      );
      // execute timeRemaining function
      expect(callback.mock.calls[0][0].timeRemaining()).toBe(50);
    });
  });

  test('cancelIdleCallback should do nothing on server', async () => {
    expect.assertions(2);

    expect(global.cancelIdleCallback).toBeUndefined();

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    await jest.isolateModulesAsync(async () => {
      const { cancelIdleCallback } = await import('../../idleCallback');

      cancelIdleCallback(123);

      // Should not call clearTimeout
      expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });
  });
});
