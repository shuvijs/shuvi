import invariant from '@shuvi/utils/invariant';
import { RspackChain } from '../base.rspack';
import { ExternalsFunction } from '../../types.rspack';

const externalsFunctionMap = new WeakMap<RspackChain, ExternalsFunction[]>();

export const checkRspackExternals = (rspackChain: RspackChain) => {
  let externals = rspackChain.get('externals');
  invariant(
    !externals ||
      (typeof externals === 'function' &&
        externals.name === 'defaultExternalsFn'),
    `Externals was modified directly, addExternals will have no effect.`
  );
};

const initExternalsHelpers = (rspackChain: RspackChain) => {
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

  let externals = rspackChain.get('externals');
  invariant(
    !externals,
    `rspackChain externals has been set, initExternalsHelpers can't work as expected.`
  );
  if (!externals) {
    externals = defaultExternalsFn;
    rspackChain.externals(externals);
    externalsFunctionMap.set(rspackChain, externalFns);
  }
};

export const addExternals = (
  rspackChain: RspackChain,
  externalFn: ExternalsFunction
) => {
  let externals = rspackChain.get('externals');

  if (!externals) {
    initExternalsHelpers(rspackChain);
  } else {
    checkRspackExternals(rspackChain);
  }

  const externalFns = externalsFunctionMap.get(rspackChain);
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

export const NODE_MODULES_REGEXP = /[\\/]node_modules[\\/]/i;

export const defaultCacheGroups = {
  default: {
    idHint: '',
    reuseExistingChunk: true,
    minChunks: 2,
    priority: -20
  },
  defaultVendors: {
    idHint: 'vendors',
    reuseExistingChunk: true,
    test: NODE_MODULES_REGEXP,
    priority: -10
  }
};

/** default splitChunks config https://github.com/webpack/webpack/blob/v5.73.0/lib/config/defaults.js#L1181 */
export const getDefaultSplitChunksConfig = (dev: boolean) => {
  return {
    chunks: 'async',
    minChunks: 1,
    minSize: dev ? 10000 : 20000,
    minRemainingSize: dev ? 0 : undefined,
    enforceSizeThreshold: dev ? 30000 : 50000,
    maxAsyncRequests: dev ? Infinity : 30,
    maxInitialRequests: dev ? Infinity : 30,
    automaticNameDelimiter: '-',
    cacheGroups: defaultCacheGroups
  };
};
