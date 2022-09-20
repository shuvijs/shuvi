import * as path from 'path';
import browserslist from 'browserslist';
import { transform, browserslistToTargets } from 'lightningcss';
import type { ImportDependency, UrlDependency } from 'lightningcss';
import { LoaderContext } from 'webpack';
import CssSyntaxError from './CssSyntaxError';
import {
  combineRequests,
  getExportCode,
  getImportCode,
  getLightningCssModuleCode,
  getPreRequester,
  isDataUrl,
  isURLRequestable,
  normalizeOptions,
  normalizeUrl,
  requestify,
  resolveRequests,
  getCssModuleOptions,
  stringifyRequest,
  normalizeSourceMap
} from './utils';

const browsersTargets = browserslistToTargets(
  browserslist('last 1 major versions')
);

export default async function loader(
  this: LoaderContext<any>,
  content: string | Buffer,
  map?: string
) {
  const rawOptions = this.getOptions();
  const callback = this.async();

  let options;

  try {
    options = normalizeOptions(rawOptions, this);
  } catch (error) {
    if (callback) {
      callback(error as Error);
    }
    return;
  }

  let isSupportAbsoluteURL = false;

  // TODO enable by default in the next major release
  if (
    this._compilation &&
    this._compilation.options &&
    this._compilation.options.experiments &&
    this._compilation.options.experiments.buildHttp
  ) {
    isSupportAbsoluteURL = true;
  }
  const isSupportDataURL =
    options.esModule &&
    this._compiler &&
    Boolean('fsStartTime' in this._compiler);

  const cssModule = getCssModuleOptions(options);

  let LightningCssRes;
  try {
    LightningCssRes = transform({
      filename: path.relative(this.rootContext, this.resourcePath),
      code: content instanceof Buffer ? content : Buffer.from(content),
      // minify: this.mode === 'production',
      cssModules: cssModule,
      analyzeDependencies: true,
      sourceMap: options.sourceMap,
      drafts: {
        nesting: true,
        customMedia: true
      },
      pseudoClasses: {},
      targets: browsersTargets
    });
    if (options.sourceMap && map) {
      LightningCssRes.map = normalizeSourceMap(map, this.resourcePath);
    }
  } catch (error: any) {
    console.error('-> error', error);
    if (callback) {
      callback(
        error.name === 'SyntaxError' ? new CssSyntaxError(error) : error
      );
    }
    return;
  }
  const { dependencies = [] } = LightningCssRes;

  const lightningImportsMap = new Map();
  const lightningUrlsMap = new Map();
  const icssMap = new Map();
  const lightningReplacementsMap = new Map();

  const lightningImports = [];
  const lightningApis = [];
  const lightningReplacements = [];
  const lightningExports = [];

  let hasUrlImportHelper = false;

  for (let index = 0; index < dependencies.length; index++) {
    const dep = dependencies[index];
    let { type, url } = dep;
    const dataUrl = isDataUrl(url);
    url = normalizeUrl(url, !dataUrl);
    url = url.trim();
    if (url.length === 0) {
      // Empty url - `@import "";` or `@import url();`
      console.error(
        "It looks like you didn't end your @import statement correctly. Child nodes are attached to it."
      );
      continue;
    }
    if (type === 'import') {
      const { supports, media } = dep as ImportDependency;
      const { requestable, needResolve } = isURLRequestable(url, {
        isSupportAbsoluteURL: false,
        isSupportDataURL: false
      });
      let prefix;

      if (requestable && needResolve) {
        const queryParts = url.split('!');

        if (queryParts.length > 1) {
          url = queryParts.pop() as string;
          prefix = queryParts.join('!');
        }
      }
      const resolver = (this as any).getResolve({
        dependencyType: 'css',
        conditionNames: ['style'],
        mainFields: ['css', 'style', 'main', '...'],
        mainFiles: ['index', '...'],
        extensions: ['.css', '...'],
        preferRelative: true
      });
      if (needResolve) {
        const request = requestify(url, this.rootContext);
        const resolvedUrl = await resolveRequests(resolver, this.context, [
          ...new Set([request, url])
        ]);

        if (!resolvedUrl) {
          continue;
        }

        if (resolvedUrl === this.resourcePath) {
          continue;
        }
        url = resolvedUrl;
      }
      if (!requestable) {
        lightningApis.push({
          url,
          layer: undefined,
          supports,
          media,
          index
        });
        continue;
      }
      url = prefix ? `${prefix}!${url}` : url;
      let importName = lightningImportsMap.get(url);
      if (!importName) {
        const { size } = lightningImportsMap;
        importName = `___CSS_LOADER_AT_RULE_IMPORT_${size}___`;
        lightningImportsMap.set(url, importName);
        lightningImports.push({
          type: 'rule_import',
          importName,
          url: stringifyRequest(
            this,
            combineRequests(getPreRequester(this)(options.importLoaders), url)
          ),
          index: size
        });
      }
      lightningApis.push({
        importName,
        layer: undefined, // not support
        supports,
        media,
        index
      });
    } else if (type === 'url') {
      const { placeholder } = dep as UrlDependency;
      const { requestable, needResolve } = isURLRequestable(url, {
        isSupportAbsoluteURL,
        isSupportDataURL
      });
      // console.log("-> url6 6", url, requestable, needResolve);
      // Do not traverse inside `url`
      if (!requestable && !needResolve) {
        if (!lightningReplacementsMap.get(url)) {
          lightningReplacementsMap.set(url, placeholder);
          lightningReplacements.push({
            placeholder,
            replacementName: url,
            hash: undefined,
            needQuotes: false,
            isString: true
          });
        }
        continue;
      }
      const queryParts = url.split('!');

      let prefix;

      if (queryParts.length > 1) {
        url = queryParts.pop() as string;
        prefix = queryParts.join('!');
      }

      const splittedUrl = url.split(/(\?)?#/);
      const [pathname, query, hashOrQuery] = splittedUrl;

      let hash = query ? '?' : '';
      hash += hashOrQuery ? `#${hashOrQuery}` : '';

      const resolver = !options.esModule
        ? (this as any).getResolve({ mainFiles: [], extensions: [] })
        : undefined;
      const request = requestify(pathname, this.rootContext, Boolean(resolver));
      if (!resolver) {
        // eslint-disable-next-line consistent-return
        url = request;
      } else {
        const resolvedURL = await resolveRequests(resolver, this.context, [
          ...new Set([request, url])
        ]);

        if (resolvedURL) {
          url = resolvedURL;
        }
      }

      if (!hasUrlImportHelper) {
        lightningImports.push({
          type: 'get_url_import',
          importName: '___CSS_LOADER_GET_URL_IMPORT___',
          url: stringifyRequest(this, require.resolve('./runtime/getUrl.js')),
          index: -1
        });

        hasUrlImportHelper = true;
      }

      url = prefix ? `${prefix}!${url}` : url;
      let importName = lightningUrlsMap.get(url);

      if (!importName) {
        importName = `___CSS_LOADER_URL_IMPORT_${lightningUrlsMap.size}___`;
        lightningUrlsMap.set(url, importName);

        lightningImports.push({
          // type: 'url',
          importName,
          url: stringifyRequest(this, url),
          index
        });

        lightningReplacements.push({
          placeholder,
          replacementName: `___CSS_LOADER_URL_REPLACEMENT_${index}___`,
          importName,
          hash,
          needQuotes: false,
          isString: false
        });
      }
    }
  }
  if (LightningCssRes.exports) {
    const resolver = (this as any).getResolve({
      dependencyType: 'icss',
      conditionNames: ['style'],
      extensions: ['...'],
      mainFields: ['css', 'style', 'main', '...'],
      mainFiles: ['index', '...'],
      preferRelative: true
    });
    const exportKeys = Object.keys(LightningCssRes.exports);
    for (const exportKey of exportKeys) {
      const exportItem = LightningCssRes.exports[exportKey];
      const { name, composes } = exportItem;
      let value = name;
      for (const compose of composes) {
        const { type } = compose;
        if (['global', 'local'].includes(type)) {
          value += ` ${compose.name}`;
        }
        if (type === 'dependency') {
          let url = compose.specifier;
          let prefix = '';

          const queryParts = url.split('!');

          if (queryParts.length > 1) {
            url = queryParts.pop() as string;
            prefix = queryParts.join('!');
          }

          const request = requestify(normalizeUrl(url, true), this.rootContext);
          const resolvedUrl = await resolveRequests(resolver, this.context, [
            ...new Set([url, request])
          ]);

          if (!resolvedUrl) {
            continue;
          }
          url = resolvedUrl;
          url = prefix ? `${prefix}!${url}` : url;
          let importName = icssMap.get(url);

          if (!importName) {
            const index = icssMap.size;
            importName = `___CSS_LOADER_ICSS_IMPORT_${index}___`;
            icssMap.set(url, importName);

            lightningImports.push({
              type: 'icss_import',
              importName,
              url: stringifyRequest(
                this,
                combineRequests(
                  getPreRequester(this)(options.importLoaders),
                  url
                )
              ),
              icss: true,
              index
            });

            lightningApis.push({ importName, dedupe: true, index });
          }

          const replacementName: string = `___REPLACEMENT_${lightningReplacements.length}_${importName}`;

          lightningReplacements.push({
            localName: compose.name,
            replacementName,
            importName
          });

          value += ` ${replacementName}`;
        }
      }
      lightningExports.push({
        name: exportKey,
        value
      });
    }
  }
  if (options.modules.exportOnlyLocals !== true) {
    lightningImports.unshift({
      type: 'api_import',
      importName: '___CSS_LOADER_API_IMPORT___',
      url: stringifyRequest(this, require.resolve('./runtime/api'))
    });

    if (options.sourceMap) {
      lightningImports.unshift({
        importName: '___CSS_LOADER_API_SOURCEMAP_IMPORT___',
        url: stringifyRequest(this, require.resolve('./runtime/sourceMaps'))
      });
    } else {
      lightningImports.unshift({
        importName: '___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___',
        url: stringifyRequest(this, require.resolve('./runtime/noSourceMaps'))
      });
    }
  }

  lightningImportsMap.clear();
  lightningUrlsMap.clear();
  icssMap.clear();
  lightningReplacementsMap.clear();

  const importCode = getImportCode(lightningImports, options);

  let moduleCode;

  try {
    moduleCode = getLightningCssModuleCode(
      LightningCssRes,
      lightningApis,
      lightningReplacements,
      options,
      this
    );
  } catch (error) {
    if (callback) {
      callback(error as Error);
    }
    return;
  }
  const exportCode = getExportCode(
    lightningExports,
    lightningReplacements,
    cssModule,
    options
  );

  const resultCode = `${importCode}${moduleCode}${exportCode}`;
  if (callback) {
    callback(null, resultCode);
  }
}

// accept Buffers instead of strings
export const raw = true;
