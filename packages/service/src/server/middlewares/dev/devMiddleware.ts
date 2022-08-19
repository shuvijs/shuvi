import ws from 'ws';
import { IncomingMessage } from 'http';
import {
  BUNDLER_DEFAULT_TARGET,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
  DEV_HOT_MIDDLEWARE_PATH,
  DEV_ORIGINAL_STACK_FRAME_ENDPOINT
} from '@shuvi/shared/lib/constants';
import {
  launchEditorMiddleware,
  stackFrameMiddleware
} from '@shuvi/error-overlay/lib/middleware';
import { BUILD_DEFAULT_DIR } from '../../../constants';
import { WebpackHotMiddleware } from './hotMiddleware';
import { Bunlder } from '../../../bundler';
import { Server } from '../../http-server';
import { IServerPluginContext } from '../../plugin';

type ICallback = () => void;

interface IContext {
  state: boolean;
  callbacks: ICallback[];
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
  bundler: Bunlder,
  serverPluginContext: IServerPluginContext
): Promise<DevMiddleware> {
  const context: IContext = {
    state: false,
    callbacks: []
  };
  // listen before watch
  bundler.onTypeCheckingDone(({ errors, warnings }) => {
    send('errors', errors);
    send('warns', warnings);
  });
  bundler.onBuildDone(({ errors, warnings }) => {
    send('errors', errors);
    send('warns', warnings);

    context.state = true;
    const { callbacks } = context;
    context.callbacks = [];
    callbacks.forEach(callback => {
      callback();
    });
  });
  bundler.watch();

  const webpackHotMiddleware = new WebpackHotMiddleware({
    disposeInactivePage: serverPluginContext.config.disposeInactivePage,
    compiler: bundler.getSubCompiler(BUNDLER_DEFAULT_TARGET)!,
    path: DEV_HOT_MIDDLEWARE_PATH
  });

  const apply = (server: Server) => {
    const targetServer = server;
    targetServer.use(
      launchEditorMiddleware(
        DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
        serverPluginContext.paths.rootDir
      )
    );
    targetServer.use(
      stackFrameMiddleware(
        DEV_ORIGINAL_STACK_FRAME_ENDPOINT,
        bundler,
        serverPluginContext.resolveBuildFile,
        BUILD_DEFAULT_DIR
      )
    );
    bundler.applyDevMiddlewares(server);
  };

  const send = (action: string, payload?: any) => {
    webpackHotMiddleware.publish({ action, data: payload });
  };

  const invalidate = () => {
    return new Promise<void>(resolve => {
      ready(context, resolve);
      bundler.watching.invalidate();
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
