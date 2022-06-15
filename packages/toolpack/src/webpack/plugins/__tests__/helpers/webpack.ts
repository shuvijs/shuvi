import { createFsFromVolume, Volume } from 'memfs';
import type {
  Stats,
  Compiler as WebpackCompiler,
  Configuration,
  NormalModule
} from 'webpack';
import webpack = require('webpack');
import { resolveFixture } from '../utils';

export interface WatchChainer {
  then(nextCb: CompileDoneCallback): this;
  end(endFn: JestDoneCallback): void;
}

export type Compiler = Omit<WebpackCompiler, 'watch'> & {
  watch(): Promise<Stats>;
  close(cb?: CompileCloseCallback): void;
  forceCompile(): void;
  waitForCompile(cb: CompileDoneCallback): WatchChainer;
};

export type CompileCloseCallback = () => void;
export type CompileDoneCallback = (s: Stats) => any;
export type JestDoneCallback = (e?: Error) => void;

function waitForCompile(compiler: Compiler, initialCb: CompileDoneCallback) {
  let check: boolean = false;
  let end: JestDoneCallback;
  let pending: Promise<any> | void;
  const queue: Array<CompileDoneCallback | JestDoneCallback> = initialCb
    ? [initialCb]
    : [];

  function shift(stats: Stats) {
    const job = queue.shift();
    if (queue.length) {
      try {
        pending = (job as CompileDoneCallback)(stats);
      } catch (e: any) {
        finish(e);
        return;
      }
    }

    if (queue.length === 1) {
      finish();
    }
  }

  function finish(err?: Error) {
    const done = queue[queue.length - 1] as JestDoneCallback;
    compiler.close(() => {
      if (done) {
        done(err);
      } else {
        new Error('waitForCompile chain is missing .then(done)');
      }
    });
  }

  const chainer = {
    then: (nextCb: CompileDoneCallback) => {
      queue.push(nextCb);
      return chainer;
    },
    end: (endFn: JestDoneCallback) => {
      queue.push(endFn);
      end = endFn;
    }
  };

  compiler.hooks.done.tap('waitForCompile', async stats => {
    if (!check) {
      check = true;
      if (!queue.length || !end) {
        compiler.close(() => {
          throw new Error('waitForCompile chain is missing .end(done)');
        });
      }
    }

    try {
      await pending;
      shift(stats);
    } catch (error: any) {
      finish(error);
    }
  });

  return chainer;
}

export function createCompiler(
  value: Configuration | WebpackCompiler
): Compiler {
  let compiler: Compiler;
  if (!(value instanceof webpack.Compiler)) {
    compiler = webpack({
      mode: 'development',
      output: {
        filename: '[name].js',
        chunkFilename: 'static/chunks/[name].js',
        path: resolveFixture('dist')
      },
      ...value
    }) as any as Compiler;
  } else {
    compiler = value as any as Compiler;
  }

  let watching: WebpackCompiler['watching'] | null = null;
  const fs = createFsFromVolume(new Volume());
  compiler.outputFileSystem = fs as any;

  const originWatch = compiler.watch as any as WebpackCompiler['watch'];
  compiler.watch = function () {
    return new Promise<any>((resolve, reject) => {
      watching = originWatch.call(
        this,
        {
          aggregateTimeout: 500,
          poll: false
        },
        (err, stats) => {
          if (err) {
            return reject(err);
          }
          resolve(stats);
        }
      );
    });
  };

  compiler.close = (cb: CompileCloseCallback) => {
    if (watching) {
      watching.close(() => {
        cb && cb();
      });
    }
  };
  compiler.forceCompile = () => {
    // delay to next tick, so we can call this in advance
    setImmediate(() => {
      if (watching) {
        watching.invalidate();
      }
    });
  };
  compiler.waitForCompile = (cb: CompileDoneCallback) => {
    return waitForCompile(compiler, cb);
  };

  return compiler;
}

export function runCompiler(
  value: Configuration | WebpackCompiler
): Promise<Stats> {
  const compiler = createCompiler(value);
  return new Promise<any>((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else if (stats!.hasErrors()) {
        reject(stats!.compilation.errors[0]);
      } else {
        resolve(stats);
      }
    });
  });
}

export function watchCompiler(
  value: Configuration | WebpackCompiler
): Compiler {
  const compiler = createCompiler(value);
  compiler.watch();
  return compiler;
}

export function getModuleSource(stats: Stats, request: string | RegExp) {
  let res: any;
  for (const m of stats.compilation.modules) {
    if (
      typeof request === 'string'
        ? (m as NormalModule).rawRequest === request
        : request.test((m as NormalModule).rawRequest)
    ) {
      res = m;
      break;
    }
  }

  return res?.originalSource().source();
}
