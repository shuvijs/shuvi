import path from 'path';
import browserslist from 'browserslist';
import { transform, browserslistToTargets } from '@parcel/css';
import type { ImportDependency, UrlDependency } from '@parcel/css';
import type { loader } from 'webpack';
import CssSyntaxError from './CssSyntaxError';
import {
  combineRequests,
  getExportCode,
  getImportCode,
  getParcelCssModuleCode,
  getPreRequester,
  isDataUrl,
  isURLRequestable,
  normalizeOptions,
  normalizeUrl,
  requestify,
  resolveRequests,
  shouldUseIcssPlugin,
  stringifyRequest,
  normalizeSourceMap
} from './utils';

const browsersTargets = browserslistToTargets(
  browserslist('last 1 major versions')
);

export default async function loader(
  this: loader.LoaderContext,
  content: string | Buffer,
  map?: string
) {
  const rawOptions = this.getOptions();
  const callback = this.async();

  let options;

  try {
    options = normalizeOptions(rawOptions, this);
  } catch (error) {
    callback(error);

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
    options.esModule && Boolean('fsStartTime' in this._compiler);

  const needToUseIcssPlugin = shouldUseIcssPlugin(options);

  let ParcelCssRes;
  try {
    ParcelCssRes = transform({
      filename: path.relative(this.rootContext, this.resourcePath),
      code: content instanceof Buffer ? content : Buffer.from(content),
      // minify: this.mode === 'production',
      cssModules: needToUseIcssPlugin,
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
      ParcelCssRes.map = normalizeSourceMap(map, this.resourcePath);
    }
  } catch (error: any) {
    console.error('-> error', error);
    callback(error.name === 'SyntaxError' ? new CssSyntaxError(error) : error);
    return;
  }
  const { dependencies = [] } = ParcelCssRes;

  const parcelImportsMap = new Map();
  const parcelUrlsMap = new Map();
  const icssMap = new Map();
  const parcelReplacementsMap = new Map();

  const parcelImports = [];
  const parcelApis = [];
  const parcelReplacements = [];
  const parcelExports = [];

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
      const resolver = this.getResolve({
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
        parcelApis.push({
          url,
          layer: undefined,
          supports,
          media,
          index
        });
        continue;
      }
      url = prefix ? `${prefix}!${url}` : url;
      let importName = parcelImportsMap.get(url);
      if (!importName) {
        const { size } = parcelImportsMap;
        importName = `___CSS_LOADER_AT_RULE_IMPORT_${size}___`;
        parcelImportsMap.set(url, importName);
        parcelImports.push({
          type: 'rule_import',
          importName,
          url: stringifyRequest(
            this,
            combineRequests(getPreRequester(this)(options.importLoaders), url)
          ),
          index: size
        });
      }
      parcelApis.push({
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
        if (!parcelReplacementsMap.get(url)) {
          parcelReplacementsMap.set(url, placeholder);
          parcelReplacements.push({
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
        ? this.getResolve({ mainFiles: [], extensions: [] })
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
        parcelImports.push({
          type: 'get_url_import',
          importName: '___CSS_LOADER_GET_URL_IMPORT___',
          url: stringifyRequest(this, require.resolve('./runtime/getUrl.js')),
          index: -1
        });

        hasUrlImportHelper = true;
      }

      url = prefix ? `${prefix}!${url}` : url;
      let importName = parcelUrlsMap.get(url);

      if (!importName) {
        importName = `___CSS_LOADER_URL_IMPORT_${parcelUrlsMap.size}___`;
        parcelUrlsMap.set(url, importName);

        parcelImports.push({
          // type: 'url',
          importName,
          url: stringifyRequest(this, url),
          index
        });

        parcelReplacements.push({
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
  if (ParcelCssRes.exports) {
    const resolver = this.getResolve({
      dependencyType: 'icss',
      conditionNames: ['style'],
      extensions: ['...'],
      mainFields: ['css', 'style', 'main', '...'],
      mainFiles: ['index', '...'],
      preferRelative: true
    });
    const exportKeys = Object.keys(ParcelCssRes.exports);
    for (const exportKey of exportKeys) {
      const exportItem = ParcelCssRes.exports[exportKey];
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

            parcelImports.push({
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

            parcelApis.push({ importName, dedupe: true, index });
          }

          const replacementName: string = `___REPLACEMENT_${parcelReplacements.length}_${importName}`;

          parcelReplacements.push({
            localName: compose.name,
            replacementName,
            importName
          });

          value += ` ${replacementName}`;
        }
      }
      parcelExports.push({
        name: exportKey,
        value
      });
    }
  }
  if (options.modules.exportOnlyLocals !== true) {
    parcelImports.unshift({
      type: 'api_import',
      importName: '___CSS_LOADER_API_IMPORT___',
      url: stringifyRequest(this, require.resolve('./runtime/api'))
    });

    if (options.sourceMap) {
      parcelImports.unshift({
        importName: '___CSS_LOADER_API_SOURCEMAP_IMPORT___',
        url: stringifyRequest(this, require.resolve('./runtime/sourceMaps'))
      });
    } else {
      parcelImports.unshift({
        importName: '___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___',
        url: stringifyRequest(this, require.resolve('./runtime/noSourceMaps'))
      });
    }
  }

  const importCode = getImportCode(parcelImports, options);

  let moduleCode;

  try {
    moduleCode = getParcelCssModuleCode(
      ParcelCssRes,
      parcelApis,
      parcelReplacements,
      options,
      this
    );
  } catch (error) {
    callback(error);

    return;
  }
  const exportCode = getExportCode(
    parcelExports,
    parcelReplacements,
    needToUseIcssPlugin,
    options
  );

  const resultCode = `${importCode}${moduleCode}${exportCode}`;

  callback(null, resultCode);
}

// accept Buffers instead of strings
export const raw = true;
