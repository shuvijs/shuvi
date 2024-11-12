import { ShuviRequest, IAppConfigByRequest } from '@shuvi/service';

export default class AppConfigManager {
  /**
   * A weakmap to store the appConfig by request
   * Never share the same appConfig between requests! Race condition will happen.
   */
  private static _appConfigWeakMap = new WeakMap<
    ShuviRequest,
    IAppConfigByRequest
  >();

  /**
   * default appConfig, can be override by `getAppConfig` hook
   */
  private static _DEFAULT_APP_CONFIG: IAppConfigByRequest = {
    router: {
      basename: ''
    }
  };

  /**
   * Retrieves the appConfig associated with the given request.
   * @throws Error if appConfig is not set for the request.
   */
  public static getAppConfig(req: ShuviRequest): IAppConfigByRequest {
    const appConfig = this._appConfigWeakMap.get(req);
    if (!appConfig) {
      // throw new Error(
      //   '[ServerPlugin Hook getAppConfig] appConfig is not set for the request'
      // );

      return this._DEFAULT_APP_CONFIG;
    }
    return appConfig;
  }

  /**
   * Associates the appConfig with the given request.
   * @throws Error if appConfig is already set for the request.
   */
  public static setAppConfig(
    req: ShuviRequest,
    appConfig: IAppConfigByRequest
  ): void {
    if (this._appConfigWeakMap.has(req)) {
      // should only set appConfig once
      return;
    }
    this._appConfigWeakMap.set(req, appConfig);
  }
}
