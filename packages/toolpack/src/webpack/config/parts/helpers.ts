import webpack from 'webpack';
import { WebpackChain } from '@shuvi/types';
import { ExternalsFunction, IWebpackHelpers } from '@shuvi/types/src/bundler';

export const webpackHelpers = (): IWebpackHelpers => {
  const externalFns: ExternalsFunction[] = [];

  const defaultExternalsFn: webpack.ExternalsFunctionElement = (
    context,
    request,
    callback
  ) => {
    let callbackCalled = false;
    const nextHandler = (err?: any, result?: any, type?: string) => {
      if (err) {
        callback(err);
        callbackCalled = true;
      } else {
        if (result !== 'next') {
          callback(err, result, type);
          callbackCalled = true;
        }
      }
    };

    for (let i = 0; i < externalFns.length; i++) {
      externalFns[i](context, request, nextHandler);
      if (callbackCalled) {
        break;
      }
    }

    if (!callbackCalled) {
      callback();
    }
  };

  return {
    addExternals: (
      webpackChain: WebpackChain,
      externalFn: ExternalsFunction
    ) => {
      let externals = webpackChain.get('externals');
      if (!externals) {
        externals = defaultExternalsFn;
        webpackChain.externals(externals);
      }

      if (
        typeof externals === 'function' &&
        externals.name === 'defaultExternalsFn'
      ) {
        externalFns.push(externalFn);
        return;
      }

      throw new Error(
        'Externals was modified directly, addExternals will have no effect.'
      );
    }
  };
};
