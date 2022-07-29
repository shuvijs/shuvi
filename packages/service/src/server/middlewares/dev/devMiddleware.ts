import * as path from 'path';
import ws from 'ws';
import { IncomingMessage } from 'http';
import {
  BUNDLER_DEFAULT_TARGET,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
  DEV_HOT_MIDDLEWARE_PATH
} from '@shuvi/shared/lib/constants';
import { createLaunchEditorMiddleware } from './launchEditorMiddleware';
import { DynamicDll, MultiCompiler } from '@shuvi/toolpack/lib/webpack';
import { WebpackHotMiddleware } from './hotMiddleware';
import { getBundler } from '../../../bundler';
import { Server } from '../../http-server';
import { IServerPluginContext } from '../../plugin';

type ICallback = () => void;

type MultiWatching = ReturnType<MultiCompiler['watch']>;

interface IContext {
  state: boolean;
  callbacks: ICallback[];
  watching: MultiWatching | undefined;
}

const wsServer = new ws.Server({ noServer: true });

function ready(context: IContext, callback: ICallback) {
  if (context.state) {
    return callback();
  }
  context.callbacks.push(callback);
}

export interface DevMiddleware {
  apply(server?: Server): void;
  send(action: string, payload?: any): void;
  invalidate(): Promise<unknown>;
  waitUntilValid(force?: boolean): void;
  onHMR(req: IncomingMessage, socket: any, head: Buffer): void;
}

export async function getDevMiddleware(
  serverPluginContext: IServerPluginContext
): Promise<DevMiddleware> {
  const bundler = await getBundler(serverPluginContext);
  const context: IContext = {
    state: false,
    callbacks: [],
    watching: undefined
  };
  let compiler;
  let dynamicDll: DynamicDll | null = null;

  if (serverPluginContext.config.experimental.preBundle) {
    dynamicDll = new DynamicDll({
      cacheDir: path.join(serverPluginContext.paths.cacheDir, 'dll'),
      rootDir: serverPluginContext.paths.rootDir,
      exclude: [/react-refresh/]
    });
  }

  compiler = await bundler.getWebpackCompiler(dynamicDll);
  // watch before pass compiler to ShuviDevMiddleware
  bundler.watch({
    onErrors(errors) {
      send('errors', errors);
    },
    onWarns(warns) {
      send('warns', warns);
    }
  });

  compiler.hooks.done.tap('shuvi-dev-middleware', () => {
    context.state = true;

    // Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling
    process.nextTick(() => {
      const { callbacks } = context;
      context.callbacks = [];

      callbacks.forEach(callback => {
        callback();
      });
    });
  });

  context.watching = compiler.watch(
    compiler.compilers.map(
      childCompiler => childCompiler.options.watchOptions || {}
    ),
    error => {
      if (error) {
        console.log(error);
      }
    }
  );

  const webpackHotMiddleware = new WebpackHotMiddleware({
    disposeInactivePage: serverPluginContext.config.disposeInactivePage,
    compiler: bundler.getSubCompiler(BUNDLER_DEFAULT_TARGET)!,
    path: DEV_HOT_MIDDLEWARE_PATH
  });

  const apply = (server: Server) => {
    const targetServer = server;
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
    return new Promise<void>(resolve => {
      ready(context, resolve);
      context.watching?.invalidate();
    });
  };

  const waitUntilValid = (force: boolean = false) => {
    if (force) {
      context.state = false;
    }
    return new Promise<void>(resolve => {
      ready(context, resolve);
    });
  };

  const onHMR = (req: IncomingMessage, _res: any, head: Buffer) => {
    wsServer.handleUpgrade(req, req.socket, head, client => {
      webpackHotMiddleware.onHMR(client);
    });
  };

  return {
    apply,
    send,
    invalidate,
    waitUntilValid,
    onHMR
  };
}
