import { IShuviMode, APIHooks, Runtime } from '@shuvi/types';
import { getApi, Api } from '../api';
import { sendHTML } from '../lib/sendHtml';
import { renderToHTML } from '../lib/renderToHTML';
import { IConfig } from '../config';

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

  async ready(): Promise<void> {
    await this._ensureApiInited();
    await this.init();
  }

  getRequestHandler() {
    return this._api.server.getRequestHandler();
  }

  async renderToHTML(ctx: Runtime.IServerContext): Promise<string | null> {
    const { server } = this._api.resources.server;
    const { html, appContext } = await renderToHTML({
      req: ctx.req as Runtime.IRequest,
      api: this._api,
      onRedirect(redirect) {
        ctx.status = redirect.status ?? 302;
        ctx.response.set({ Location: redirect.path });
        ctx.body = '';
        return;
      }
    });

    // set 404 statusCode
    if (appContext.statusCode) {
      ctx.status = appContext.statusCode;
    }

    if (server.onViewDone) {
      server.onViewDone(ctx, { html, appContext });
    }

    return html;
  }

  async close() {
    await this._api.destory();
  }

  async listen(port: number, hostname: string = 'localhost'): Promise<void> {
    await this._ensureApiInited();
    this._api.emitEvent<APIHooks.IEventServerListen>('server:listen', {
      port,
      hostname
    });
    await Promise.all([this._api.server.listen(port, hostname), this.ready()]);
  }

  protected abstract getMode(): IShuviMode;

  protected abstract init(): Promise<void> | void;

  protected _handle404(ctx: Runtime.IServerContext) {
    ctx.status = 404;
    ctx.body = '';
    return;
  }

  protected async _handlePageRequest(
    ctx: Runtime.IServerContext
  ): Promise<void> {
    try {
      const html = await this.renderToHTML(ctx);
      if (html) {
        sendHTML(ctx, html);
      }
    } catch (error) {
      if (this.getMode() === 'development') {
        console.error('render error', error);
      }
      ctx.status = 500;
      ctx.body = 'Server Render Error';
    }
  }

  private async _ensureApiInited() {
    if (this._api) {
      return;
    }

    this._api = await this._apiPromise;
  }
}
