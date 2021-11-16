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

import { transform } from '../../utils/load-sources';

function getSWCOptions({
  filename,
  isServer,
  development,
  isPageFile,
  isNextDist,
  hasReactRefresh
}) {
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');

  const jsc = {
    parser: {
      syntax: isTypeScript ? 'typescript' : 'ecmascript',
      dynamicImport: true,
      // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
      [isTypeScript ? 'tsx' : 'jsx']: isTSFile ? false : true
    },

    transform: {
      react: {
        runtime: 'automatic',
        // runtime: 'classic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment',
        throwIfNamespace: true,
        development: development,
        useBuiltins: true,
        refresh: hasReactRefresh
      },
      optimizer: {
        simplify: false,
        globals: {
          typeofs: {
            window: isServer ? 'undefined' : 'object'
          }
        }
      },
      regenerator: {
        importPath: require.resolve('regenerator-runtime')
      }
    }
  };

  if (isServer) {
    return {
      jsc,
      // Disables getStaticProps/getServerSideProps tree shaking on the server compilation for pages
      disableNextSsg: true,
      disablePageConfig: true,
      isDevelopment: development,
      isPageFile,
      env: {
        targets: {
          // Targets the current version of Node.js
          node: process.versions.node
        }
      }
    };
  } else {
    // Matches default @babel/preset-env behavior
    jsc.target = 'es5';
    return {
      // Ensure Next.js internals are output as commonjs modules
      ...(isNextDist
        ? {
            module: {
              type: 'commonjs'
            }
          }
        : {}),
      disableNextSsg: !isPageFile,
      isDevelopment: development,
      isPageFile,
      jsc
    };
  }
}

async function loaderTransform(source, inputSourceMap) {
  // Make the loader async
  const filename = this.resourcePath;

  let loaderOptions = (this.getOptions && this.getOptions()) || {};

  const { isNode, hasReactRefresh } = loaderOptions;

  const isDev = this.mode === 'development';

  const swcOptions = getSWCOptions({
    filename,
    isServer: isNode,
    isPageFile: true,
    development: isDev,
    isNextDist: false,
    hasReactRefresh: isDev && !isNode
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
// export const raw = true
