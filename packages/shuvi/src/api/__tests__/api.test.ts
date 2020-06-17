import { getApi, Api } from '../api';
import { PluginApi } from '../pluginApi';

describe('api', () => {
  let gApi: Api;
  beforeAll(async () => {
    gApi = await getApi({
      mode: 'development',
      config: {},
    });
  });

  test('should has "production" be default mode', async () => {
    const prodApi = await getApi({ config: {} });
    expect(prodApi.mode).toBe('production');
  });

  test('plugins', async () => {
    let pluginApi: PluginApi;
    const api = await getApi({
      config: { plugins: [(api) => (pluginApi = api)] },
    });
    expect(pluginApi!).toBeDefined();
    expect(pluginApi!.paths).toBe(api.paths);
  });

  test('getPluginApi', () => {
    const pluginApi = gApi.getPluginApi();

    expect(pluginApi.mode).toBe(gApi.mode);
    expect(pluginApi.paths).toBe(gApi.paths);
    expect(pluginApi.config).toBe(gApi.config);

    [
      'tap',
      'callHook',
      'on',
      'emitEvent',
      'addEntryCode',
      'addAppFile',
      'addAppExport',
      'addAppPolyfill',
      'resolveAppFile',
      'resolveUserFile',
      'resolveBuildFile',
      'resolvePublicFile',
      'getAssetPublicUrl',
    ].forEach((method) => {
      // @ts-ignore
      expect(typeof pluginApi[method]).toBe('function');
    });
  });
});
