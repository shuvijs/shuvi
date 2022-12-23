import logger from '@shuvi/utils/logger';

export interface IResources {
  [x: string]: any;
}

let isCached = false;
let requireTarget = '';
const cache = {} as IResources;

const proxyHandler = {
  get: function (target: IResources, props: string) {
    let result = target[props];
    if (result) {
      return result;
    }
    try {
      const proxyObj = (requireTarget && require(requireTarget)) || {};
      result = proxyObj[props];
      if (typeof result === 'function') {
        result = result();
      }
    } catch (error) {
      logger.error(
        `"resouces.${props}" is not ready, try access it when necessary.`
      );
      throw error;
    }

    if (isCached) {
      cache[props] = result;
    }
    return result;
  }
};
export const _setResourceEnv = function (cached: boolean, requireStr: string) {
  isCached = cached;
  requireTarget = requireStr;
};
const proxy = new Proxy(cache, proxyHandler);
proxy._setResourceEnv = _setResourceEnv;

export default proxy;
