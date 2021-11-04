import * as APIHooks from '../types/hooks';
import { createLaunchEditorMiddleware } from './launchEditorMiddleware';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import { WebpackHotMiddleware } from './hotMiddleware';
import { Api } from '../api';
import { getBundler } from '../bundler';
import {
  BUNDLER_TARGET_CLIENT,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
  DEV_HOT_MIDDLEWARE_PATH
} from '@shuvi/shared/lib/constants';

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

  const webpackDevMiddleware = WebpackDevMiddleware(compiler as any, {
    stats: false, // disable stats on server
    publicPath: api.assetPublicPath,
    writeToDisk: true
  });

  const webpackHotMiddleware = new WebpackHotMiddleware({
    compiler: bundler.getSubCompiler(BUNDLER_TARGET_CLIENT)!,
    path: DEV_HOT_MIDDLEWARE_PATH
  });

  const apply = () => {
    api.server.use(webpackDevMiddleware);
    api.server.use(webpackHotMiddleware.middleware as any);
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
