import { loader } from 'webpack';
import loaderUtils from 'loader-utils';

module.exports = function (this: loader.LoaderContext) {
  const { module }: any = loaderUtils.getOptions(this) || {};
  const sModule = JSON.stringify(module);
  this.cacheable(false);

  return `
module.exports = require(${sModule})

if (module.hot) {
  // accept self, since this module can be disposed and re-evaluated without 
  // informing parents
  module.hot.accept(() => { /* noop */ })
}
`.trim();
};
