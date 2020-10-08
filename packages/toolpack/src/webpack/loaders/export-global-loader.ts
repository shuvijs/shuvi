// @ts-ignore Poor webpack own typings https://github.com/webpack/webpack/issues/10828
import { loader } from '@types/webpack';
import loaderUtils from 'loader-utils';

export type ClientPagesLoaderOptions = {
  absolutePagePath: string;
  page: string;
};

const nextClientPagesLoader: loader.Loader = function () {
  const { absolutePath, exportName, globalName } = loaderUtils.getOptions(this);

  const stringifyGlobalName = JSON.stringify(globalName);
  const stringifyAbsolutePath = loaderUtils.stringifyRequest(
    this,
    absolutePath as string
  );
  const stringifyName = JSON.stringify(exportName);

  return `
var mod = require(${stringifyAbsolutePath})
(window[${stringifyGlobalName}] = window[${stringifyGlobalName}] || {})[${stringifyName}] = mod.default || mod

if(module.hot) {
  module.hot.accept(${stringifyAbsolutePath}, function() {
    if(!${stringifyGlobalName} in window) return

    var updatedMod = require(${stringifyAbsolutePath})
    window[${stringifyGlobalName}] = updatedMod.default || updatedMod
  })
}
`;
};

export default nextClientPagesLoader;
