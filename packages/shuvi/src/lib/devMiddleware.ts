import { Hooks } from "@shuvi/types";
import ForkTsCheckerWebpackPlugin, {
  createCodeframeFormatter
} from "@shuvi/toolpack/lib/utils/forkTsCheckerWebpackPlugin";
import formatWebpackMessages from "@shuvi/toolpack/lib/utils/formatWebpackMessages";
import { createLaunchEditorMiddleware } from "@shuvi/toolpack/lib/utils/errorOverlayMiddleware";
import WebpackDevMiddleware from "webpack-dev-middleware";
import WebpackHotMiddleware from "webpack-hot-middleware";
import { Api } from "../api";
import { getBundler } from "../bundler";
import {
  WEBPACK_CONFIG_CLIENT,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
  DEV_HOT_MIDDLEWARE_PATH
} from "../constants";

type CompilerDiagnostics = {
  errors: string[];
  warnings: string[];
};

interface WatchCompilerOptions {
  useTypeScript: boolean;
  log: (...args: any[]) => void;
  onFirstSuccess?: () => void;
}

export interface DevMiddleware {
  apply(): void;
  send(action: string, payload?: any): void;
  watchCompiler(
    name: string,
    { useTypeScript, log, onFirstSuccess }: WatchCompilerOptions
  ): void;
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
  const webpackDevMiddleware = WebpackDevMiddleware(compiler, {
    publicPath: api.assetPublicPath,
    noInfo: true,
    logLevel: "silent",
    watchOptions: {
      ignored: [/[\\/]\.git[\\/]/, /[\\/]node_modules[\\/]/]
    },
    writeToDisk: true
  });
  const webpackHotMiddleware = WebpackHotMiddleware(
    bundler.getSubCompiler(WEBPACK_CONFIG_CLIENT)!,
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
    webpackDevMiddleware.publish({ action, data: payload });
  };

  const watchCompiler = (
    name: string,
    { useTypeScript, log }: WatchCompilerOptions
  ) => {
    const compiler = bundler.getSubCompiler(name)!;
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
            send("errors", messages.errors);
          } else if (messages.warnings && messages.warnings.length > 0) {
            send("warnings", messages.warnings);
          }
        }
      }

      const messages = formatWebpackMessages(statsData);
      const isSuccessful = !messages.errors.length && !messages.warnings.length;
      if (isSuccessful) {
        _log("Compiled successfully!");
        await api.callHook<Hooks.IBuildDone>(
          { name: "build:done", parallel: true },
          {
            first: isFirstSuccessfulCompile,
            name: compiler.name,
            stats
          }
        );
        isFirstSuccessfulCompile = false;
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
  };

  const invalidate = () => {
    webpackDevMiddleware.invalidate();
  };

  const waitUntilValid = (force: boolean = false) => {
    if (force) {
      // private api
      // we know that there must be a rebuild so it's safe to do this
      webpackDevMiddleware.context.state = false;
    }
    return new Promise(resolve => {
      webpackDevMiddleware.waitUntilValid(resolve);
    });
  };

  return {
    apply,
    send,
    watchCompiler,
    invalidate,
    waitUntilValid
  };
}
