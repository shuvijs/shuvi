import { APIHooks } from '@shuvi/types';
import { createLaunchEditorMiddleware } from '@shuvi/toolpack/lib/utils/errorOverlayMiddleware';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackDevMiddlewareOptionSchema from './devMiddleware.schema';
import { validate } from '@shuvi/utils/lib/schemaUtils';
import WebpackHotMiddleware from 'webpack-hot-middleware';
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
  invalidate(): void;
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
    onErrors(errros) {
      send('errors', errros);
    },
    onWarns(warns) {
      send('warns', warns);
    }
  });

  let devMiddlewareOptions: WebpackDevMiddleware.Options = {
    logLevel: 'silent',
    watchOptions: {
      ignored: [/[\\/]\.git[\\/]/, /[\\/]node_modules[\\/]/]
    }
  };

  devMiddlewareOptions = await api.callHook<APIHooks.IHookDevMiddleware>({
    name: 'bundler:devMiddleware',
    initialValue: devMiddlewareOptions
  });

  validate(WebpackDevMiddlewareOptionSchema as any, devMiddlewareOptions, {
    name: 'bundler:devMiddleware'
  });

  const webpackDevMiddleware = WebpackDevMiddleware(compiler, {
    ...devMiddlewareOptions,
    publicPath: api.assetPublicPath,
    writeToDisk: true
  });

  const webpackHotMiddleware = WebpackHotMiddleware(
    bundler.getSubCompiler(BUNDLER_TARGET_CLIENT)!,
    {
      path: DEV_HOT_MIDDLEWARE_PATH,
      log: false,
      heartbeat: 2500
    }
  );

  const apply = () => {
    api.server.use(webpackDevMiddleware);
    api.server.use(webpackHotMiddleware);
    api.server.use(
      createLaunchEditorMiddleware(DEV_HOT_LAUNCH_EDITOR_ENDPOINT)
    );
  };

  const send = (action: string, payload?: any) => {
    webpackHotMiddleware.publish({ action, data: payload });
  };

  const invalidate = () => {
    webpackDevMiddleware.invalidate();
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

  api.tap<APIHooks.IHookDestory>('destory', {
    name: 'DevMiddleware',
    fn() {
      return new Promise(resolve => {
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
