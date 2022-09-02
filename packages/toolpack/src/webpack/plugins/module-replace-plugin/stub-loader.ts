import { PitchLoaderDefinitionFunction, LoaderContext } from 'webpack';

export interface ModuleReplaceOption {
  replacedModule: string;
}

const isSelfLoader = (l: any) => l.path !== __filename;

const genRequest = (loaderCtx: LoaderContext<any>, loaders: any[]) => {
  const loaderStrings: string[] = [];

  loaders.forEach(loader => {
    const request = typeof loader === 'string' ? loader : loader.request;
    // loader.request contains both the resolved loader path and its options
    // query (e.g. ??ref-0)
    loaderStrings.push(request);
  });

  return JSON.stringify(
    loaderCtx.utils.contextify(
      loaderCtx.context || loaderCtx.rootContext,
      '-!' +
        [
          ...loaderStrings,
          loaderCtx.resourcePath + loaderCtx.resourceQuery
        ].join('!')
    )
  );
};

export const pitch: PitchLoaderDefinitionFunction<ModuleReplaceOption> =
  function (this) {
    this.cacheable(false);

    const { replacedModule } = this.getOptions() || {};
    let loaders = this.loaders;

    // remove self
    loaders = loaders.filter(isSelfLoader);

    const request = replacedModule
      ? JSON.stringify(
          this.utils.contextify(
            this.context || this.rootContext,
            replacedModule
          )
        )
      : genRequest(this, loaders);

    return `
import mod from ${request}; 
export * from ${request}
export default mod;
`.trim();
  };
