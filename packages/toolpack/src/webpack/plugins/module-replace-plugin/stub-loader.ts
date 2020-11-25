import { loader } from 'webpack';
import loaderUtils from 'loader-utils';

const isSelfLoader = (l: any) => l.path !== __filename;

const genRequest = (loaderCtx: loader.LoaderContext, loaders: any[]) => {
  const loaderStrings: string[] = [];

  loaders.forEach(loader => {
    const request = typeof loader === 'string' ? loader : loader.request;
    // loader.request contains both the resolved loader path and its options
    // query (e.g. ??ref-0)
    loaderStrings.push(request);
  });

  return loaderUtils.stringifyRequest(
    loaderCtx,
    '!' +
      [...loaderStrings, loaderCtx.resourcePath + loaderCtx.resourceQuery].join(
        '!'
      )
  );
};

module.exports = (code: string) => code;

module.exports.pitch = function (this: loader.LoaderContext) {
  this.cacheable(false);

  const { replacedModule }: any = loaderUtils.getOptions(this) || {};
  let loaders = this.loaders;

  // remove self
  loaders = loaders.filter(isSelfLoader);

  const request = replacedModule
    ? loaderUtils.stringifyRequest(this, replacedModule)
    : genRequest(this, loaders);

  return `
import mod from ${request}; 
export * from ${request}
export default mod;
`.trim();
};
