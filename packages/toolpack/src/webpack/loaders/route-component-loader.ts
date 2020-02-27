import { loader } from "webpack";
import loaderUtils from "loader-utils";

export type RouteComponentLoaderOptions = {
  componentAbsolutePath: string;
  active: boolean;
};

const routeComponentLoader: loader.Loader = function() {
  const { componentAbsolutePath }: any = loaderUtils.getOptions(this);

  const stringifyRequest = loaderUtils.stringifyRequest(
    this,
    `${componentAbsolutePath}?__shuvi-route`
  );

  return `
const = require(${stringifyRequest})
`.trim();
};

export default routeComponentLoader;
