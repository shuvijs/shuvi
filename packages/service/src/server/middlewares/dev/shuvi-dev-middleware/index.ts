import middleware from './middleware';
import setupHooks from './utils/setupHooks';
import setupWriteToDisk from './utils/setupWriteToDisk';
import setupOutputFileSystem from './utils/setupOutputFileSystem';
import ready from './utils/ready';
import {
  MultiCompiler,
  IContext,
  IOptions,
  IRequestHandlerWithNext,
  IShuviDevMiddleware
} from './types';

export default function shuviDevMiddleware(
  compiler: MultiCompiler,
  options: IOptions
): IShuviDevMiddleware & IRequestHandlerWithNext {
  const context: IContext = {
    state: false,
    stats: undefined,
    callbacks: [],
    options,
    compiler,
    watching: undefined,
    outputFileSystem: undefined
  };

  setupHooks(context);
  setupWriteToDisk(context);
  setupOutputFileSystem(context);

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

  const instance: any = middleware(context);

  instance.waitUntilValid = (callback = () => {}) => {
    ready(context, callback);
  };
  instance.invalidate = (callback = () => {}) => {
    ready(context, callback);

    context.watching?.invalidate();
  };
  instance.context = context;

  return instance;
}
