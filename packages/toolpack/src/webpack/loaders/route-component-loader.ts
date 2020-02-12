import { loader } from "webpack";
import loaderUtils from "loader-utils";

export type RouteComponentLoaderOptions = {
  componentAbsolutePath: string;
  active: boolean;
};

const routeComponentLoader: loader.Loader = function() {
  const { componentAbsolutePath }: any = loaderUtils.getOptions(this);

  return `
const = require("${componentAbsolutePath}?__shuvi-route")
`.trim();
};

export default routeComponentLoader;
