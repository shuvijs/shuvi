import {
  DEV_HOT_MIDDLEWARE_PATH,
  DEV_READY_ENDPOINT
} from '@shuvi/shared/constants';
import { Watchpack, watch as watcher } from '@shuvi/utils/lib/fileWatcher';
import { getDefineEnv } from '@shuvi/toolpack/lib/webpack/config';
import { join } from 'path';
import { Bundler } from '../bundler';
import {
  setupTypeScript,
  getJavaScriptInfo,
  ParsedJsConfig,
  loadJsConfig
} from '../bundler/typescript';
import { Server } from '../server/http-server';
import { ShuviServer } from './shuviServer';
import { normalizeServerMiddleware } from './serverMiddleware';
import {
  getDevMiddleware,
  DevMiddleware
} from './middlewares/dev/devMiddleware';
import { applyHttpProxyMiddleware } from './middlewares/httpProxyMiddleware';
import { getAssetMiddleware } from './middlewares/getAssetMiddleware';
import { ShuviDevServerOptions, ShuviRequestHandler } from './shuviServerTypes';
import { loadDotenvConfig } from '../config/env';

export class ShuviDevServer extends ShuviServer {
  private _bundler: Bundler;
  private _webpackWatcher?: typeof Watchpack | null;
  private verifyingTypeScript?: boolean;

  constructor(
    corePluginContext: any,
    { bundler, ...options }: ShuviDevServerOptions
  ) {
    super(corePluginContext, options);
    this._catchUnexpectedError();
    this._bundler = bundler;
  }

  async init() {
    const { _serverContext: context, _server: server } = this;
    const { rootDir } = context.paths;

    const devMiddleware = getDevMiddleware(this._bundler, context);

    let ready = false;
    // muse be the first middleware, to make sure the build is finisehd.
    server.use((async (req, resp, next) => {
      if (!ready) {
        await devMiddleware.waitUntilValid();
        ready = true;
      }

      if (req.pathname === DEV_READY_ENDPOINT) {
        resp.end();
        return;
      }

      next();
    }) as ShuviRequestHandler);

    if (this._options.getMiddlewaresBeforeDevMiddlewares) {
      const serverMiddlewaresBeforeDevMiddleware = [
        this._options.getMiddlewaresBeforeDevMiddlewares(devMiddleware, context)
      ]
        .flat()
        .map(m => normalizeServerMiddleware(m, { rootDir }));
      serverMiddlewaresBeforeDevMiddleware.forEach(({ path, handler }) => {
        server.use(path, handler);
      });
    }

    if (context.config.proxy) {
      applyHttpProxyMiddleware(server, context.config.proxy);
    }
    // keep the order
    devMiddleware.apply(server);
    server.use(getAssetMiddleware(context));
    await this._initMiddlewares();

    // setup upgrade listener eagerly when we can otherwise
    // it will be done on the first request via req.socket.server
    this._setupWebSocketHandler(server, devMiddleware);

    await this.startWatcher(devMiddleware);
  }

  private _catchUnexpectedError() {
    process.on('unhandledRejection', reason => {
      console.error(`Caught unhandledRejection: \n`, reason, '\n');
    });
    process.on('uncaughtException', err => {
      console.error(`Caught uncaughtException: \n`, err, '\n');
    });
  }

  // todo: move into devMiddleware?
  private _setupWebSocketHandler = (
    server: Server,
    devMiddleware: DevMiddleware
  ) => {
    server.onUpgrade((req, socket, head) => {
      if (req.url?.startsWith(DEV_HOT_MIDDLEWARE_PATH)) {
        devMiddleware.onHMR(req, socket, head);
      }
    });
  };

  private async startWatcher(devMiddleware: DevMiddleware): Promise<void> {
    if (this._webpackWatcher) {
      return;
    }

    const { routesDir, rootDir } = this._serverContext.paths;
    const files: string[] = [];
    const directories: string[] = [routesDir];
    const fileWatchTimes = new Map();
    const configs = this._bundler.targets;

    let { useTypeScript } = getJavaScriptInfo();
    let enableTypeScript: boolean = useTypeScript;

    const envFiles = [
      '.env.development.local',
      '.env.local',
      '.env.development',
      '.env'
    ].map(file => join(rootDir, file));
    files.push(...envFiles);

    // tsconfig/jsconfig paths
    const tsconfigPaths = [
      join(rootDir, 'tsconfig.json'),
      join(rootDir, 'jsconfig.json')
    ];
    files.push(...tsconfigPaths);

    this._webpackWatcher = watcher(
      {
        directories,
        files,
        startTime: 0
      },
      async ({ knownFiles }) => {
        let envChange = false;
        let tsconfigChange: boolean = false;

        for (const [fileName, timeInfo] of knownFiles) {
          if (
            !files.includes(fileName) &&
            !directories.some(dir => fileName.startsWith(dir))
          ) {
            continue;
          }

          const watchTime = fileWatchTimes.get(fileName);
          const watchTimeChange =
            watchTime && watchTime !== timeInfo?.timestamp;

          fileWatchTimes.set(fileName, timeInfo?.timestamp);

          if (envFiles.includes(fileName)) {
            if (watchTimeChange) {
              envChange = true;
            }
            continue;
          }

          if (tsconfigPaths.includes(fileName)) {
            if (
              fileName.endsWith('tsconfig.json') &&
              fileWatchTimes.get(fileName)
            ) {
              enableTypeScript = true;
            }
            if (watchTimeChange) {
              tsconfigChange = true;
            }
            continue;
          }

          if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) {
            enableTypeScript = true;
          }
        }

        if (!useTypeScript && enableTypeScript) {
          await this.verifyTypeScript(enableTypeScript);
          useTypeScript = true;
          tsconfigChange = true;
        }

        if (tsconfigChange || envChange) {
          let parseJsConfig: ParsedJsConfig | undefined;

          if (tsconfigChange) {
            parseJsConfig = await loadJsConfig(rootDir, { typescript: true });
          }

          if (envChange) {
            loadDotenvConfig({ rootDir, forceReloadEnv: true });
          }

          configs.forEach(({ config }) => {
            if (tsconfigChange) {
              config.resolve?.plugins?.forEach((plugin: any) => {
                // look for the JsConfigPathsPlugin and update with the latest paths/baseUrl config
                if (plugin && plugin.jsConfigPlugin && parseJsConfig) {
                  const { resolvedBaseUrl, compilerOptions } = parseJsConfig;

                  if (compilerOptions.paths && resolvedBaseUrl) {
                    Object.keys(plugin.paths).forEach(key => {
                      delete plugin.paths[key];
                    });

                    plugin.paths = { ...compilerOptions.paths };
                    plugin.resolvedBaseUrl = resolvedBaseUrl;
                  }
                }
              });
            }

            if (envChange) {
              config.plugins?.forEach((plugin: any) => {
                // we look for the DefinePlugin definitions so we can
                // update them on the active compilers
                if (
                  plugin &&
                  typeof plugin.definitions === 'object' &&
                  plugin.definitions.__SHUVI_DEFINE_ENV
                ) {
                  const newDefine = {
                    __SHUVI_DEFINE_ENV: 'true',
                    ...getDefineEnv(this._serverContext.config.env)
                  };
                  Object.keys(plugin.definitions).forEach(key => {
                    if (!(key in newDefine)) {
                      delete plugin.definitions[key];
                    }
                  });
                  Object.assign(plugin.definitions, newDefine);
                }
              });
            }
          });

          await devMiddleware?.invalidate();
        }
      }
    );
  }

  private async verifyTypeScript(enableTypeScript: boolean) {
    if (this.verifyingTypeScript) {
      return;
    }
    try {
      this.verifyingTypeScript = true;
      await setupTypeScript(this._serverContext.paths, {
        reportMissingError: false,
        enableTypeScript: enableTypeScript
      });
    } finally {
      this.verifyingTypeScript = false;
    }
  }

  async close() {
    if (this._webpackWatcher) {
      this._webpackWatcher();
      this._webpackWatcher = null;
    }
    await super.close();
  }
}
