import webpack from 'webpack';
import { WebpackChain } from '@shuvi/types';
import { ExternalsFunction, IWebpackHelpers } from '@shuvi/types/src/bundler';

interface IExternalsFn extends webpack.ExternalsFunctionElement {
  externalFns: ExternalsFunction[];
}
const createDefaultExternalsFn = () => {
  const externalFns: ExternalsFunction[] = [];

  const defaultExternalsFn: IExternalsFn = (context, request, callback) => {
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

  defaultExternalsFn.externalFns = externalFns;

  return defaultExternalsFn;
};

export const webpackHelpers: IWebpackHelpers = {
  addExternals: (webpackChain: WebpackChain, externalFn: ExternalsFunction) => {
    let externals = webpackChain.get('externals');

    if (!externals) {
      externals = createDefaultExternalsFn();
      webpackChain.externals(externals);
    }

    if (
      typeof externals === 'function' &&
      externals.name === 'defaultExternalsFn'
    ) {
      externals.externalFns.push(externalFn);
      return;
    }

    throw new Error(
      'Externals was modified directly, addExternals will have no effect.'
    );
  }
};
