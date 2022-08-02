/*
Copyright (c) 2017 The swc Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/
import querystring from 'querystring';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';
import { escapeRegExp } from '@shuvi/utils/lib/escapeRegExp';
import { transform } from '@shuvi/compiler/swc';
import getLoaderSWCOptions from './getLoaderSWCOptions';

const IS_PAGE_FILE = RegExp(escapeRegExp(`?${ROUTE_RESOURCE_QUERYSTRING}`));

async function loaderTransform(source, inputSourceMap) {
  // Make the loader async
  const filename = this.resourcePath;

  let loaderOptions = this.getOptions() || {};

  const {
    isServer,
    experimental,
    compiler,
    supportedBrowsers,
    swcCacheDir,
    hasReactRefresh,
    minify = false
  } = loaderOptions;

  const isPageFile = !!(
    this.resourceQuery && IS_PAGE_FILE.test(this.resourceQuery)
  );

  let keep = [];

  if (isPageFile) {
    const query = querystring.parse(this.resourceQuery.slice(1));
    if (query.keep) {
      if (Array.isArray(query.keep)) {
        keep = query.keep;
      } else {
        keep.push(query.keep);
      }
    }
  }

  const isDevelopment = this.mode === 'development';

  const swcOptions = getLoaderSWCOptions({
    filename,
    isServer,
    isPageFile,
    minify,
    development: this.mode === 'development',
    hasReactRefresh:
      hasReactRefresh !== undefined
        ? hasReactRefresh
        : isDevelopment && !isServer,
    experimental,
    compiler,
    supportedBrowsers,
    swcCacheDir,
    keep
  });

  const programmaticOptions = {
    ...swcOptions,
    filename,
    inputSourceMap: inputSourceMap ? JSON.stringify(inputSourceMap) : undefined,

    // Set the default sourcemap behavior based on Webpack's mapping flag,
    sourceMaps: this.sourceMap,
    inlineSourcesContent: this.sourceMap,

    // Ensure that Webpack will get a full absolute path in the sourcemap
    // so that it can properly map the module back to its internal cached
    // modules.
    sourceFileName: filename
  };

  if (!programmaticOptions.inputSourceMap) {
    delete programmaticOptions.inputSourceMap;
  }

  // auto detect development mode
  if (
    this.mode &&
    programmaticOptions.jsc &&
    programmaticOptions.jsc.transform &&
    programmaticOptions.jsc.transform.react &&
    !Object.prototype.hasOwnProperty.call(
      programmaticOptions.jsc.transform.react,
      'development'
    )
  ) {
    programmaticOptions.jsc.transform.react.development =
      this.mode === 'development';
  }

  return transform(source, programmaticOptions).then(output => {
    return [output.code, output.map ? JSON.parse(output.map) : undefined];
  });
}

export default function swcLoader(inputSource, inputSourceMap) {
  const callback = this.async && this.async();
  loaderTransform.call(this, inputSource, inputSourceMap).then(
    ([transformedSource, outputSourceMap]) => {
      callback &&
        callback(null, transformedSource, outputSourceMap || inputSourceMap);
    },
    err => {
      callback && callback(err);
    }
  );
}

// accept Buffers instead of strings
export const raw = true;
