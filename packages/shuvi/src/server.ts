import { constants } from "@shuvi/core";
import ForkTsCheckerWebpackPlugin, {
  createCodeframeFormatter
} from "@shuvi/toolpack/lib/utils/forkTsCheckerWebpackPlugin";
import formatWebpackMessages from "@shuvi/toolpack/lib/utils/formatWebpackMessages";
import { createLaunchEditorMiddleware } from "@shuvi/toolpack/lib/utils/errorOverlayMiddleware";
import { MultiCompiler, Compiler } from "webpack";
import Express from "express";
import WebpackDevMiddleware from "webpack-dev-middleware";
import WebpackHotMiddleware from "webpack-hot-middleware";
import { ROUTE_PREFIX, LAUNCH_EDITOR_ENDPOINT } from "./constants";

type CompilerDiagnostics = {
  errors: string[];
  warnings: string[];
};

interface Config {
  host: string;
  port: number;
  publicPath: string;
}

export default class Server {
  private _compiler: MultiCompiler;
  private _app: Express.Application;
  private _config: Config;
  private _webpackHotMiddleware: any;
  private _middlewares: Express.RequestHandler[] = [];

  constructor(compiler: MultiCompiler, config: Config) {
    this._config = config;
    this._compiler = compiler;
    this._app = Express();
    this._webpackHotMiddleware = WebpackHotMiddleware(compiler, {
      path: `${ROUTE_PREFIX}/webpack-hmr`,
      log: false,
      heartbeat: 2500
    });
  }

  send(action: string, payload?: any) {
    this._webpackHotMiddleware.publish({ action, data: payload });
  }

  start() {
    const { _app: app, _compiler: compiler } = this;

    app.use(
      WebpackDevMiddleware(compiler, {
        publicPath: this._config.publicPath,
        noInfo: true,
        logLevel: "silent",
        watchOptions: {
          ignored: [
            /[\\/]\.git[\\/]/,
            /[\\/]node_modules[\\/]/,
            RegExp(`[\\\\/].${constants.NAME}[\\\\/]`)
          ]
        },
        writeToDisk: true
      })
    );
    app.use(this._webpackHotMiddleware);
    app.use(createLaunchEditorMiddleware(LAUNCH_EDITOR_ENDPOINT));

    this._middlewares.forEach(m => {
      this._app.use(m);
    });

    app.listen(this._config.port, this._config.host, err => {
      if (err) {
        return console.log(err);
      }

      console.log("Starting the development server...\n");
    });
  }

  watchCompiler(
    compiler: Compiler,
    {
      useTypeScript,
      log
    }: { useTypeScript: boolean; log: (...args: any[]) => void }
  ) {
    let isFirstSuccessfulCompile = true;
    let tsMessagesPromise: Promise<CompilerDiagnostics> | undefined;
    let tsMessagesResolver: (diagnostics: CompilerDiagnostics) => void;

    compiler.hooks.invalid.tap(`invalid`, () => {
      log("Compiling...");
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
          log("Files successfully emitted, waiting for typecheck results...");
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
        log("Compiled successfully!");
        if (isFirstSuccessfulCompile) {
          isFirstSuccessfulCompile = false;
          log(`app in running on: http://localhost:${this._config.port}`);
        }
      }

      // If errors exist, only show errors.
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        log("Failed to compile.\n");
        log(messages.errors.join("\n\n"));
        return;
      }

      // Show warnings if no errors were found.
      if (messages.warnings.length) {
        log("Compiled with warnings.\n");
        log(messages.warnings.join("\n\n"));
      }
    });
  }

  use(handle: Express.RequestHandler) {
    this._middlewares.push(handle);
    return this._app;
  }
}
