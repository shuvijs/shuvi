import { loader } from "webpack";
import loaderUtils from "loader-utils";


module.exports = function(this: loader.LoaderContext) {
  const { module, dep }: any = loaderUtils.getOptions(this) || {};
  const sModule = JSON.stringify(module);
  this.cacheable(false);
  // this.addDependency(dep);

  return `
module.exports = require(${sModule})
`.trim();
};
