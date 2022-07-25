import setupHooks from './utils/setupHooks';
import ready from './utils/ready';
import {
  MultiCompiler,
  IContext,
  IOptions,
  IRequest,
  IResponse,
  INextFunc,
  IRequestHandlerWithNext,
  IShuviDevMiddleware
} from './types';

export default function ShuviDevMiddleware(
  compiler: MultiCompiler,
  options: IOptions
): IRequestHandlerWithNext & IShuviDevMiddleware {
  const context: IContext = {
    state: false,
    stats: undefined,
    callbacks: [],
    options,
    compiler,
    watching: undefined
  };

  setupHooks(context);

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

  const instance = async (_req: IRequest, _res: IResponse, next: INextFunc) => {
    return await new Promise(resolve => {
      ready(context, () => {
        resolve(next());
      });
    });
  };

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
