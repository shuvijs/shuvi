import { initWebpackHelpers, addExternals } from '../helpers';
import { WebpackChain } from '../../base';

const setupTest = () => {
  const chain = new WebpackChain();

  return {
    chain
  };
};

describe('webpackHelpers', () => {
  describe('addExternals', () => {
    test('should work with 1 externalFn', () => {
      const { chain } = setupTest();
      const mockExternalFn = jest.fn();
      const defaultCallback = jest.fn();

      expect(chain.get('externals')).toBeUndefined();

      initWebpackHelpers(chain);

      addExternals(chain, mockExternalFn);

      const newExternalFn = chain.get('externals');
      expect(newExternalFn.name).toBe('defaultExternalsFn');

      expect(mockExternalFn).toBeCalledTimes(0);
      newExternalFn(
        { context: 'test context', request: 'test request' },
        defaultCallback
      );

      expect(mockExternalFn).toBeCalledWith(
        { context: 'test context', request: 'test request' },
        expect.anything()
      );

      // No matter what defaultCallback should only be called 1 time
      expect(defaultCallback).toBeCalledTimes(1);
    });

    test('should exit when one of the externalFn invoke callback', () => {
      const { chain } = setupTest();
      const defaultCallback = jest.fn();

      const mockExternalFn1 = jest.fn().mockImplementation((_, next) => {
        next(null, 'next');
      });

      const shouldInvokeCallback = jest.fn().mockImplementation((_, next) => {
        next();
      });

      const mockExternalFn3 = jest.fn().mockImplementation((_, next) => {
        next(null, 'next');
      });

      initWebpackHelpers(chain);

      addExternals(chain, mockExternalFn1);
      addExternals(chain, shouldInvokeCallback);
      addExternals(chain, mockExternalFn3);

      const newExternalFn = chain.get('externals');
      newExternalFn(
        { context: 'test context', request: 'test request' },
        defaultCallback
      );

      expect(mockExternalFn1).toBeCalledTimes(1);
      expect(shouldInvokeCallback).toBeCalledTimes(1);
      // Does not run because callback is called
      expect(mockExternalFn3).toBeCalledTimes(0);

      // No matter what defaultCallback should only be called 1 time
      expect(defaultCallback).toBeCalledTimes(1);
    });

    test('should throw error when externals is directly modified', () => {
      const { chain } = setupTest();

      chain.externals('dummyExternals');

      expect(() =>
        addExternals(chain, () => {})
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invariant failed: Externals was modified directly, addExternals will have no effect."`
      );
    });

    test('should throw error when call initWebpackHelpers twice', () => {
      const { chain } = setupTest();

      initWebpackHelpers(chain);

      expect(() =>
        initWebpackHelpers(chain)
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invariant failed: webpackChain externals has been set, initWebpackHelpers can't work as expected."`
      );
    });
  });
});
