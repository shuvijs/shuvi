import { APIHooks } from '@shuvi/types';
import { createLaunchEditorMiddleware } from '@shuvi/toolpack/lib/utils/errorOverlayMiddleware';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import c2k from 'koa-connect';
import { WebpackHotMiddleware } from './hotMiddleware';
import WebpackDevMiddlewareOptionSchema from './devMiddleware.schema';
import { validate } from '@shuvi/utils/lib/schemaUtils';
import { Api } from '../api';
import { getBundler } from '../bundler';
import {
  BUNDLER_TARGET_CLIENT,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
  DEV_HOT_MIDDLEWARE_PATH
} from '../constants';

export interface DevMiddleware {
  apply(): void;
  send(action: string, payload?: any): void;
  invalidate(): Promise<unknown>;
  waitUntilValid(force?: boolean): void;
}

export async function getDevMiddleware({
  api
}: {
  api: Api;
}): Promise<DevMiddleware> {
  const bundler = getBundler(api);
  const compiler = await bundler.getWebpackCompiler();
  // watch before pass compiler to WebpackDevMiddleware
  bundler.watch({
    onErrors(errors) {
      send('errors', errors);
    },
    onWarns(warns) {
      send('warns', warns);
    }
  });

  let devMiddlewareOptions: WebpackDevMiddleware.Options = {
    logLevel: 'silent',
    watchOptions: {
      aggregateTimeout: 500,
      ignored: ['**/.git/**', '**/node_modules/**']
    }
  };

  devMiddlewareOptions = await api.callHook<
    APIHooks.IHookModifyDevMiddlewareOption
  >({
    name: 'bundler:modifyDevMiddlewareOption',
    initialValue: devMiddlewareOptions
  });

  validate(WebpackDevMiddlewareOptionSchema as any, devMiddlewareOptions, {
    name: 'bundler:modifyDevMiddlewareOption'
  });

  const webpackDevMiddleware = WebpackDevMiddleware(compiler, {
    ...devMiddlewareOptions,
    publicPath: api.assetPublicPath,
    writeToDisk: true
  });

  const webpackHotMiddleware = new WebpackHotMiddleware({
    compiler: bundler.getSubCompiler(BUNDLER_TARGET_CLIENT)!,
    path: DEV_HOT_MIDDLEWARE_PATH
  });

  const apply = () => {
    const webpackDevHandler = c2k(webpackDevMiddleware) as any;
    api.server.use(async (ctx, next) => {
      ctx.status = 200;
      await webpackDevHandler(ctx, next);
    });
    api.server.use(webpackHotMiddleware.middleware);
    api.server.use(
      createLaunchEditorMiddleware(DEV_HOT_LAUNCH_EDITOR_ENDPOINT)
    );
  };

  const send = (action: string, payload?: any) => {
    webpackHotMiddleware.publish({ action, data: payload });
  };

  const invalidate = () => {
    return new Promise(resolve => webpackDevMiddleware.invalidate(resolve));
  };

  const waitUntilValid = (force: boolean = false) => {
    if (force) {
      // private api
      // we know that there must be a rebuild so it's safe to do this
      // @ts-ignore
      webpackDevMiddleware.context.state = false;
    }
    return new Promise(resolve => {
      webpackDevMiddleware.waitUntilValid(resolve);
    });
  };

  api.tap<APIHooks.IHookDestroy>('destroy', {
    name: 'DevMiddleware',
    fn() {
      return new Promise(resolve => {
        webpackHotMiddleware.close();
        webpackDevMiddleware.close(resolve);
      });
    }
  });

  return {
    apply,
    send,
    invalidate,
    waitUntilValid
  };
}
