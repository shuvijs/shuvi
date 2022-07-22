import middleware from './middleware';
import setupHooks from './utils/setupHooks';
import setupWriteToDisk from './utils/setupWriteToDisk';
import ready from './utils/ready';
import {
  MultiCompiler,
  IContext,
  IOptions,
  IRequestHandlerWithNext,
  IShuviDevMiddleware
} from './types';

export default function ShuviDevMiddleware(
  compiler: MultiCompiler,
  options: IOptions
): IShuviDevMiddleware & IRequestHandlerWithNext {
  const context: IContext = {
    state: false,
    stats: undefined,
    callbacks: [],
    options,
    compiler,
    watching: undefined
  };

  setupHooks(context);
  setupWriteToDisk(context);

  // Start watching
  context.watching = context.compiler.watch(
    context.compiler.compilers.map(
      childCompiler => childCompiler.options.watchOptions || {}
    ),
    error => {
      if (error) {
        console.log(error);
      }
    }
  );

  const instance = middleware(context) as any;

  instance.waitUntilValid = (callback = () => {}, force: boolean) => {
    if (force) {
      context.state = false;
    }
    ready(context, callback);
  };
  instance.invalidate = (callback = () => {}) => {
    ready(context, callback);

    context.watching?.invalidate();
  };

  return instance;
}
