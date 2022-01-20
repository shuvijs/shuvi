export type IResources<Extra = {}> = {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

let isCached = false;
let requireTarget = '';
const cache: IResources = {};

const proxyHandler = {
  get: function (target: IResources, props: string) {
    let result = target[props];
    if (result) {
      return result;
    }
    const proxyObj = (requireTarget && require(requireTarget)) || {};
    result = proxyObj[props];
    if (typeof result === 'function') {
      result = result();
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
module.exports = proxy;
proxy._setResourceEnv = _setResourceEnv;
