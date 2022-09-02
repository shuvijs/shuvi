import { LoaderDefinition } from 'webpack';

export type RouteComponentLoaderOptions = {
  componentAbsolutePath: string;
  active: boolean;
};

const routeComponentLoader: LoaderDefinition<RouteComponentLoaderOptions> =
  function (this) {
    const { componentAbsolutePath } = this.getOptions(this);

    const stringifyRequest = JSON.stringify(
      this.utils.contextify(
        this.context || this.rootContext,
        `${componentAbsolutePath}?__shuvi-route`
      )
    );

    return `
const = require(${stringifyRequest})
`.trim();
  };

export default routeComponentLoader;
