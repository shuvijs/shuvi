/**
 * @jest-environment jsdom
 */

describe('awaitPageLoadAndIdle', () => {
  let originalRequestIdleCallback: typeof window.requestIdleCallback;
  let originalCancelIdleCallback: typeof window.cancelIdleCallback;

  beforeAll(() => {
    // Save the original `requestIdleCallback` and `cancelIdleCallback` for restoration
    originalRequestIdleCallback = window.requestIdleCallback;
    originalCancelIdleCallback = window.cancelIdleCallback;

    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true
    });
  });

  beforeEach(() => {
    // Restore mocks after each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore mocks after each test
    jest.clearAllMocks();
    window.requestIdleCallback = originalRequestIdleCallback;
    window.cancelIdleCallback = originalCancelIdleCallback;
    // @ts-expect-error test purpose
    document.readyState = 'loading'; // Reset the readyState
  });

  it('should resolve immediately if the page is already loaded and idle time condition is met', async () => {
    expect.assertions(2);

    // @ts-expect-error test purpose
    document.readyState = 'complete';

    window.requestIdleCallback = jest.fn(callback => {
      const fakeDeadline = { timeRemaining: () => 50 } as IdleDeadline;
      return setTimeout(() => callback(fakeDeadline), 10) as unknown as number;
    });
    window.cancelIdleCallback = jest.fn(id => {
      clearTimeout(id);
    });

    await jest.isolateModulesAsync(async () => {
      const { awaitPageLoadAndIdle } = await import('../../idleCallback');
      await expect(awaitPageLoadAndIdle()).resolves.toBeUndefined();
      expect(window.cancelIdleCallback).not.toHaveBeenCalled();
    });
  });

  it('should wait until the page load event is triggered', async () => {
    expect.assertions(2);

    // @ts-expect-error test purpose
    document.readyState = 'loading';

    window.requestIdleCallback = jest.fn(callback => {
      const fakeDeadline = { timeRemaining: () => 50 } as IdleDeadline;
      return setTimeout(() => callback(fakeDeadline), 10) as unknown as number;
    });
    window.cancelIdleCallback = jest.fn(id => {
      clearTimeout(id);
    });

    await jest.isolateModulesAsync(async () => {
      const { awaitPageLoadAndIdle } = await import('../../idleCallback');
      const promise = awaitPageLoadAndIdle();

      // Simulate page load event
      setTimeout(() => {
        // @ts-expect-error test purpose
        document.readyState = 'complete';
        window.dispatchEvent(new Event('load'));
      }, 20);

      await expect(promise).resolves.toBeUndefined();
      expect(window.cancelIdleCallback).not.toHaveBeenCalled();
    });
  });

  it('should resolve after the timeout if idle time is not sufficient', async () => {
    expect.assertions(2);

    // @ts-expect-error test purpose
    document.readyState = 'complete';

    window.requestIdleCallback = jest.fn(callback => {
      const fakeDeadline = { timeRemaining: () => 10 } as IdleDeadline;
      return setTimeout(() => callback(fakeDeadline), 10) as unknown as number;
    });
    window.cancelIdleCallback = jest.fn(id => {
      clearTimeout(id);
    });
    await jest.isolateModulesAsync(async () => {
      const { awaitPageLoadAndIdle } = await import('../../idleCallback');
      await expect(
        awaitPageLoadAndIdle({ remainingTime: 49, timeout: 1000 })
      ).resolves.toBeUndefined();
      expect(window.cancelIdleCallback).toHaveBeenCalled();
    });
  });
});
