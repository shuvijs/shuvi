import {
  BUNDLER_DEFAULT_TARGET,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
  DEV_HOT_MIDDLEWARE_PATH
} from '@shuvi/shared/lib/constants';
import { createLaunchEditorMiddleware } from './launchEditorMiddleware';
import { WebpackDevMiddleware, DynamicDll } from '@shuvi/toolpack/lib/webpack';
import { WebpackHotMiddleware } from './hotMiddleware';
import { getBundler } from '../../../bundler';
import { Server } from '../../http-server';
import { IServerPluginContext } from '../../plugin';

export interface DevMiddleware {
  apply(server?: Server): void;
  send(action: string, payload?: any): void;
  invalidate(): Promise<unknown>;
  waitUntilValid(force?: boolean): void;
}

export async function getDevMiddleware(
  serverPluginContext: IServerPluginContext
): Promise<DevMiddleware> {
  const bundler = await getBundler(serverPluginContext);
  let compiler;
  let dynamicDll: DynamicDll | null = null;

  if (serverPluginContext.config.experimental.preBundle) {
    dynamicDll = new DynamicDll({
      dir: serverPluginContext.paths.cacheDir,
      exclude: [/react-refresh/]
    });
  }

  compiler = await bundler.getWebpackCompiler(dynamicDll);
  // watch before pass compiler to WebpackDevMiddleware
  bundler.watch({
    onErrors(errors) {
      send('errors', errors);
    },
    onWarns(warns) {
      send('warns', warns);
    }
  });

  // webpackDevMiddleware make first compiler build assets as static sources
  const webpackDevMiddleware = WebpackDevMiddleware(compiler as any, {
    stats: false, // disable stats on server
    publicPath: serverPluginContext.assetPublicPath,
    writeToDisk: true
  });

  const webpackHotMiddleware = new WebpackHotMiddleware({
    compiler: bundler.getSubCompiler(BUNDLER_DEFAULT_TARGET)!,
    path: DEV_HOT_MIDDLEWARE_PATH
  });

  const apply = (server: Server) => {
    const targetServer = server;
    targetServer.use(webpackDevMiddleware);
    targetServer.use(webpackHotMiddleware.middleware as any);
    targetServer.use(
      createLaunchEditorMiddleware(DEV_HOT_LAUNCH_EDITOR_ENDPOINT)
    );
    if (dynamicDll) {
      targetServer.use(dynamicDll.middleware);
    }
  };

  const send = (action: string, payload?: any) => {
    webpackHotMiddleware.publish({ action, data: payload });
  };

  const invalidate = () => {
    return new Promise(resolve => {
      webpackDevMiddleware.invalidate(resolve);
    });
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

  return {
    apply,
    send,
    invalidate,
    waitUntilValid
  };
}
