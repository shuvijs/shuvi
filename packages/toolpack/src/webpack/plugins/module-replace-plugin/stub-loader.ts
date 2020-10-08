// @ts-ignore Poor webpack own typings https://github.com/webpack/webpack/issues/10828
import { loader } from '@types/webpack';
import loaderUtils from 'loader-utils';

module.exports = function (this: loader.LoaderContext) {
  const { module }: any = loaderUtils.getOptions(this) || {};
  const sModule = JSON.stringify(module);
  this.cacheable(false);

  return `
module.exports = require(${sModule})
`.trim();
};
