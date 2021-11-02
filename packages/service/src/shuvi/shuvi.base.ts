import { IShuviMode, IConfig, getApi, Api } from '../api';
import * as APIHooks from '../types/hooks';
import { IResponse, IRequest } from '../types/server';

export interface IShuviConstructorOptions {
  cwd: string;
  config: IConfig;
  configFile?: string;
}

export default abstract class Shuvi {
  protected _api!: Api;
  private _apiPromise: Promise<Api>;

  constructor({ cwd, config, configFile }: IShuviConstructorOptions) {
    this._apiPromise = getApi({
      cwd,
      config,
      configFile,
      mode: this.getMode()
    });
  }

  protected abstract getMode(): IShuviMode;

  protected abstract init(): Promise<void> | void;

  private async _ensureApiInited() {
    if (this._api) {
      return;
    }

    this._api = await this._apiPromise;
  }

  async prepare(): Promise<void> {
    await this._ensureApiInited();
    await this.init();
  }

  getRequestHandler() {
    return this._api.server.getRequestHandler();
  }

  protected _handleErrorSetStatusCode(
    req: IRequest,
    res: IResponse,
    statusCode: number = 404,
    errorMessage: string = ''
  ) {
    res.statusCode = statusCode;
    res.end(errorMessage);
    return;
  }

  protected _getBeforePageMiddlewares() {
    return this._api.getBeforePageMiddlewares();
  }

  protected createBeforePageMiddlewares = () => {
    const middlewares = this._getBeforePageMiddlewares();
    middlewares.forEach(({ path, handler }) =>
      this._api.server.use(path, handler)
    );
  };

  protected _getAfterPageMiddlewares() {
    return this._api.getAfterPageMiddlewares();
  }

  protected createAfterPageMiddlewares = () => {
    const middlewares = this._getAfterPageMiddlewares();
    middlewares.forEach(({ path, handler }) =>
      this._api.server.use(path, handler)
    );
  };

  async listen(port: number, hostname: string = 'localhost'): Promise<void> {
    await this._ensureApiInited();
    this._api.emitEvent<APIHooks.IEventServerListen>('server:listen', {
      port,
      hostname
    });
    await Promise.all([
      this._api.server.listen(port, hostname),
      this.prepare()
    ]);
  }

  async close() {
    await this._api.destory();
  }
}
