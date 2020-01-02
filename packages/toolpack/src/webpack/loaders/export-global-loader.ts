import { loader } from "webpack";
import loaderUtils from "loader-utils";

export type ClientPagesLoaderOptions = {
  absolutePagePath: string;
  page: string;
};

const nextClientPagesLoader: loader.Loader = function() {
  const { absolutePath, exportName, globalName } = loaderUtils.getOptions(this);

  const quotedGlobalName = JSON.stringify(globalName);
  const quotedAbsolutePagePath = JSON.stringify(absolutePath);
  const quotedExportName = JSON.stringify(exportName);

  return `
var mod = require(${quotedAbsolutePagePath})
(window[${quotedGlobalName}] = window[${quotedGlobalName}] || {})[${quotedExportName}] = mod.default || mod

if(module.hot) {
  module.hot.accept(${quotedAbsolutePagePath}, function() {
    if(!${quotedGlobalName} in window) return

    var updatedMod = require(${quotedAbsolutePagePath})
    window[${quotedGlobalName}] = updatedMod.default || updatedMod
  })
}
`;
};

export default nextClientPagesLoader;
