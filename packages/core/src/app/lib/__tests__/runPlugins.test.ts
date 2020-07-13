import runPlugins from '../runPlugins';
import { Runtime } from '@shuvi/types';
import mockedInitPlugin from '@shuvi/app/core/plugin';
import mockedPluginsHash from '@shuvi/app/core/pluginsHash';

jest.mock(
  '@shuvi/app/core/plugin',
  () => {
    return {
      __esModule: true,
      default: jest.fn().mockImplementation(({ applyPluginOption }) => {
        applyPluginOption('testPlugin', {
          extraOption: true
        });
      })
    };
  },
  { virtual: true }
);

jest.mock(
  '@shuvi/app/core/pluginsHash',
  () => {
    let samplePluginsHash = {
      testPlugin: jest
        .fn()
        .mockImplementation((tap: Runtime.IApplication['tap']) => {
          tap('tapTestHook', {
            name: 'testPlugin',
            fn: () => {}
          });
        })
    };
    return {
      __esModule: true,
      default: samplePluginsHash
    };
  },
  { virtual: true }
);

describe('runPlugins', () => {
  let tap = jest.fn();

  afterEach(() => {
    tap.mockReset();
  });

  test('should call initPlugins and run the plugins', () => {
    runPlugins(tap);

    // should call initPlugin
    expect(mockedInitPlugin).toBeCalledWith({
      registerPlugin: tap,
      applyPluginOption: expect.any(Function)
    });

    // should inject options into the plugin
    expect(mockedPluginsHash.testPlugin.options).toMatchObject({
      extraOption: true
    });

    // should call tap with plugin
    expect(tap).toBeCalledWith('tapTestHook', {
      name: 'testPlugin',
      fn: expect.anything()
    });

    // should call plugin with option
    expect(mockedPluginsHash.testPlugin).toBeCalledWith(tap, {
      extraOption: true
    });
  });
});
