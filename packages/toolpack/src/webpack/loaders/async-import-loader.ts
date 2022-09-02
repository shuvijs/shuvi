import { LoaderContext, PitchLoaderDefinitionFunction } from 'webpack';

interface Loader {
  request: string;
  path: string;
  query: string;
}

export type RouteComponentLoaderOptions = {
  componentAbsolutePath: string;
  active: boolean;
};

const isNotSelf = (l: Loader) => l.path !== __filename;

function genRequest(loaders: Loader[], context: LoaderContext<any>) {
  const loaderStrings = loaders.map(loader => {
    return typeof loader === 'string' ? loader : loader.request;
  });
  const resource = context.resourcePath + context.resourceQuery;

  return JSON.stringify(
    context.utils.contextify(
      context.context || context.rootContext,
      '-!' + [...loaderStrings, resource].join('!')
    )
  );
}

export const pitch: PitchLoaderDefinitionFunction = function () {
  const loaders = this.loaders.filter(isNotSelf);

  const request = genRequest(loaders, this);
  return `
import(${request});
`;
};
