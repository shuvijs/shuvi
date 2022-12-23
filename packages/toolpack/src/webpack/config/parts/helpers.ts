import invariant from '@shuvi/utils/invariant';
import { WebpackChain } from '../base';
import { ExternalsFunction } from '../../types';

const externalsFunctionMap = new WeakMap<WebpackChain, ExternalsFunction[]>();

export const checkWebpackExternals = (webpackChain: WebpackChain) => {
  let externals = webpackChain.get('externals');
  invariant(
    !externals ||
      (typeof externals === 'function' &&
        externals.name === 'defaultExternalsFn'),
    `Externals was modified directly, addExternals will have no effect.`
  );
};

const initExternalsHelpers = (webpackChain: WebpackChain) => {
  const externalFns: ExternalsFunction[] = [];

  const defaultExternalsFn: ExternalsFunction = (
    { context, request },
    callback
  ) => {
    let callbackCalled = false;
    const nextHandler = (err?: any, result?: any) => {
      if (err) {
        callback(err, undefined);
        callbackCalled = true;
      } else {
        if (result !== 'next') {
          callback(err, result);
          callbackCalled = true;
        }
      }
    };

    for (let i = 0; i < externalFns.length; i++) {
      externalFns[i]({ context, request }, nextHandler);
      if (callbackCalled) {
        break;
      }
    }

    if (!callbackCalled) {
      callback(null, undefined);
    }
  };

  let externals = webpackChain.get('externals');
  invariant(
    !externals,
    `webpackChain externals has been set, initWebpackHelpers can't work as expected.`
  );
  if (!externals) {
    externals = defaultExternalsFn;
    webpackChain.externals(externals);
    externalsFunctionMap.set(webpackChain, externalFns);
  }
};

export const addExternals = (
  webpackChain: WebpackChain,
  externalFn: ExternalsFunction
) => {
  let externals = webpackChain.get('externals');

  if (!externals) {
    initExternalsHelpers(webpackChain);
  } else {
    checkWebpackExternals(webpackChain);
  }

  const externalFns = externalsFunctionMap.get(webpackChain);
  externalFns!.push(externalFn);
};

export function shouldUseRelativeAssetPaths(publicPath: string) {
  return publicPath === './';
}

export function splitChunksFilter(chunk: any) {
  const excludes: Record<string, boolean> = {
    // 'static/polyfill': true
  };

  return excludes[chunk.name] !== true;
}

export const commonChunkFilename = ({ dev }: { dev: boolean }) => {
  return `static/common/${dev ? '[name]' : '[name].[contenthash:8]'}.js`;
};
