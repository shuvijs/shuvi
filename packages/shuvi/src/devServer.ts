import ForkTsCheckerWebpackPlugin, {
  createCodeframeFormatter
} from "@shuvi/toolpack/lib/utils/forkTsCheckerWebpackPlugin";
import formatWebpackMessages from "@shuvi/toolpack/lib/utils/formatWebpackMessages";
import { createLaunchEditorMiddleware } from "@shuvi/toolpack/lib/utils/errorOverlayMiddleware";
import { MultiCompiler, Compiler } from "webpack";
import WebpackDevMiddleware from "webpack-dev-middleware";
import WebpackHotMiddleware from "webpack-hot-middleware";
import { createServer, Server, RequestHandle } from "./server";
import { DEV_HOT_LAUNCH_EDITOR_ENDPOINT, DEV_HOT_MIDDLEWARE_PATH } from "./constants";

type CompilerDiagnostics = {
  errors: string[];
  warnings: string[];
};

interface Options {
  host: string;
  port: number;
  publicPath: string;
}

export default class DevServer {
  private _inited: boolean = false;
  private _app: Server;
  private _options: Options;
  private _webpackDevMiddleware: any;
  private _webpackHotMiddleware: any;
  private _beforeMiddlewares: RequestHandle[] = [];
  private _afterMiddlewares: RequestHandle[] = [];

  constructor(compiler: MultiCompiler, options: Options) {
    this._options = options;
    this._app = createServer();
    this._webpackDevMiddleware = WebpackDevMiddleware(compiler, {
      publicPath: this._options.publicPath,
      noInfo: true,
      logLevel: "silent",
      watchOptions: {
        ignored: [/[\\/]\.git[\\/]/, /[\\/]node_modules[\\/]/]
      },
      writeToDisk: true
    });
    this._webpackHotMiddleware = WebpackHotMiddleware(compiler.compilers[0], {
      path: DEV_HOT_MIDDLEWARE_PATH,
      log: false,
      heartbeat: 2500
    });
  }

  send(action: string, payload?: any) {
    this._webpackHotMiddleware.publish({ action, data: payload });
  }

  getRequestHandler() {
    const { _app: app } = this;

    if (this._inited) {
      return app;
    }

    this._beforeMiddlewares.forEach(m => {
      this._app.use(m);
    });

    app.use(this._webpackDevMiddleware);
    app.use(this._webpackHotMiddleware);
    app.use(createLaunchEditorMiddleware(DEV_HOT_LAUNCH_EDITOR_ENDPOINT));

    this._afterMiddlewares.forEach(m => {
      this._app.use(m);
    });

    return app;
  }

  watchCompiler(
    compiler: Compiler,
    {
      useTypeScript,
      log,
      onFirstSuccess
    }: {
      useTypeScript: boolean;
      log: (...args: any[]) => void;
      onFirstSuccess?: () => void;
    }
  ) {
    const name = compiler.options.name;
    let onFirstSuccessHandle: any = null;
    let isFirstSuccessfulCompile = true;
    let tsMessagesPromise: Promise<CompilerDiagnostics> | undefined;
    let tsMessagesResolver: (diagnostics: CompilerDiagnostics) => void;

    const _log = (...args: string[]) => log(`[${name}]`, ...args);
    compiler.hooks.invalid.tap(`invalid`, () => {
      _log("Compiling...");
    });

    if (useTypeScript) {
      const typescriptFormatter = createCodeframeFormatter({});

      compiler.hooks.beforeCompile.tap("beforeCompile", () => {
        tsMessagesPromise = new Promise(resolve => {
          tsMessagesResolver = msgs => resolve(msgs);
        });
      });

      ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).receive.tap(
        "afterTypeScriptCheck",
        (diagnostics: any[], lints: any[]) => {
          const allMsgs = [...diagnostics, ...lints];
          const format = (message: any) => {
            const file = (message.file || "").replace(/\\/g, "/");
            const formated = typescriptFormatter(message, true);
            return `${file}\n${formated}`;
          };

          tsMessagesResolver({
            errors: allMsgs.filter(msg => msg.severity === "error").map(format),
            warnings: allMsgs
              .filter(msg => msg.severity === "warning")
              .map(format)
          });
        }
      );
    }

    // "done" event fires when Webpack has finished recompiling the bundle.
    // Whether or not you have warnings or errors, you will get this event.
    compiler.hooks.done.tap("done", async stats => {
      // We have switched off the default Webpack output in WebpackDevServer
      // options so we are going to "massage" the warnings and errors and present
      // them in a readable focused way.
      // We only construct the warnings and errors for speed:
      // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
      const statsData = stats.toJson({
        all: false,
        warnings: true,
        errors: true
      });

      if (useTypeScript && statsData.errors.length === 0) {
        const delayedMsg = setTimeout(() => {
          _log("Files successfully emitted, waiting for typecheck results...");
        }, 100);

        const messages = await tsMessagesPromise;
        clearTimeout(delayedMsg);
        if (messages) {
          if (messages.errors && messages.errors.length > 0) {
            this.send("errors", messages.errors);
          } else if (messages.warnings && messages.warnings.length > 0) {
            this.send("warnings", messages.warnings);
          }
        }
      }

      const messages = formatWebpackMessages(statsData);
      const isSuccessful = !messages.errors.length && !messages.warnings.length;
      if (isSuccessful) {
        _log("Compiled successfully!");
        if (isFirstSuccessfulCompile) {
          if (onFirstSuccessHandle) {
            clearTimeout(onFirstSuccessHandle);
          }
          onFirstSuccessHandle = setTimeout(() => {
            isFirstSuccessfulCompile = false;
            onFirstSuccess && onFirstSuccess();
          }, 1000);
        }
      }

      // If errors exist, only show errors.
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        _log("Failed to compile.\n");
        _log(messages.errors.join("\n\n"));
        return;
      }

      // Show warnings if no errors were found.
      if (messages.warnings.length) {
        _log("Compiled with warnings.\n");
        _log(messages.warnings.join("\n\n"));
      }
    });
  }

  invalidate() {
    this._webpackDevMiddleware.invalidate();
  }

  waitUntilValid(force: boolean = false) {
    const middleware = this._webpackDevMiddleware;
    if (force) {
      // private api
      // we know that there must be a rebuild so it's safe to do this
      middleware.context.state = false;
    }
    return new Promise(resolve => {
      middleware.waitUntilValid(resolve);
    });
  }

  before(handle: RequestHandle) {
    this._beforeMiddlewares.push(handle);
    return this._app;
  }

  use(handle: RequestHandle) {
    this._afterMiddlewares.push(handle);
    return this._app;
  }
}
