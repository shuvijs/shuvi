import {
  IApplication,
  IAppPluginRecord,
  IInitAppPlugins
} from '../../../types';
import runPlugins from '../runPlugins';

const initPlugins = jest.fn().mockImplementation(({ applyPluginOption }) => {
  applyPluginOption('testPlugin', {
    extraOption: true
  });
}) as IInitAppPlugins;

const pluginRecord = {
  testPlugin: jest.fn().mockImplementation((tap: IApplication['tap']) => {
    tap('tapTestHook', {
      name: 'testPlugin',
      fn: () => {}
    });
  })
} as IAppPluginRecord;

describe('runPlugins', () => {
  let tap = jest.fn();

  afterEach(() => {
    tap.mockReset();
  });

  test('should call initPlugins and run the plugins', () => {
    runPlugins({ tap, initPlugins, pluginRecord });

    // should call initPlugin
    expect(initPlugins).toBeCalledWith({
      registerPlugin: tap,
      applyPluginOption: expect.any(Function)
    });

    // should inject options into the plugin
    expect(pluginRecord.testPlugin.options).toMatchObject({
      extraOption: true
    });

    // should call tap with plugin
    expect(tap).toBeCalledWith('tapTestHook', {
      name: 'testPlugin',
      fn: expect.anything()
    });

    // should call plugin with option
    expect(pluginRecord.testPlugin).toBeCalledWith(tap, {
      extraOption: true
    });
  });
});
