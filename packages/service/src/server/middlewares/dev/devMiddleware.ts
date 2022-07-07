import { extname, join } from 'path';
import { readFileSync, statSync } from 'fs-extra';
import { lookup } from 'mrmime';
import { IncomingMessage, ServerResponse } from 'http';
import {
  BUNDLER_DEFAULT_TARGET,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
  DEV_HOT_MIDDLEWARE_PATH
} from '@shuvi/shared/lib/constants';
import { createLaunchEditorMiddleware } from './launchEditorMiddleware';
import { WebpackDevMiddleware } from '@shuvi/toolpack/lib/webpack';
import { WebpackHotMiddleware } from './hotMiddleware';
import { getBundler } from '../../../bundler';
import { Server } from '../../http-server';
import { IServerPluginContext } from '../../plugin';
import {
  DEFAULT_DLL_PUBLIC_PATH,
  DEFAULT_TMP_DIR_NAME
} from '../../../constants';
import { getDllDir } from '../../../bundler/dynamicDll';

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

  async function dllMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: (...args: any[]) => any
  ) {
    const url = req.url || '';
    const shouldServe = url.startsWith(DEFAULT_DLL_PUBLIC_PATH);
    if (!shouldServe) {
      return next();
    }

    bundler.onBuildComplete(() => {
      const relativePath = url.replace(
        new RegExp(`^${DEFAULT_DLL_PUBLIC_PATH}`),
        '/'
      );
      const filePath = join(
        getDllDir(join(process.cwd(), DEFAULT_TMP_DIR_NAME)),
        relativePath
      );
      const { mtime } = statSync(filePath);
      // Get the last modification time of the file and convert the time into a world time string
      let lastModified = mtime.toUTCString();
      const ifModifiedSince = req.headers['if-modified-since'];

      // Tell the browser what time to use the browser cache without asking the server directly, but it seems that it is not effective, and needs to learn why.
      res.setHeader('cache-control', 'no-cache');

      if (ifModifiedSince && lastModified <= ifModifiedSince) {
        // If the request header contains the request ifModifiedSince and the file is not modified, it returns 304
        res.writeHead(304, 'Not Modified');
        res.end();
        return;
      }
      // Return the header Last-Modified for the last modification time of the current request file
      res.setHeader('Last-Modified', lastModified);
      // Return file
      res.setHeader('content-type', lookup(extname(url)) || 'text/plain');
      const content = readFileSync(filePath);
      res.statusCode = 200;
      res.end(content);
    });
  }

  const apply = (server: Server) => {
    const targetServer = server;
    targetServer.use(webpackDevMiddleware);
    targetServer.use(webpackHotMiddleware.middleware as any);
    targetServer.use(
      createLaunchEditorMiddleware(DEV_HOT_LAUNCH_EDITOR_ENDPOINT)
    );
    if (serverPluginContext.config.experimental.preBundle) {
      targetServer.use(dllMiddleware);
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
