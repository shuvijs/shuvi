import fs from 'fs';
import nodePath from 'path';
import { ResolvePlugin, Resolver, ResolveRequest } from 'webpack';

/**
 * ResolveWithSuffixFirstPlugin
 * With this plugin, webpack will try to resolve with `.suffix` first.
 *
 * 1. new ResolveWithSuffixFirstPlugin({ suffix: 'electron' })
 *    import a from './a';
 *    try './a.electron', if not exist -> './a'
 *
 * 2. new ResolveWithSuffixFirstPlugin({ suffix: 'web' })
 *    import a from './a'
 *    try './a.web', if not exist -> './a'
 */

interface Options {
  suffix: string;
}

const SOURCE_EVENT = 'described-resolve'; // Note: is the name of the event that starts the pipeline
const TARGET_EVENT = 'resolve'; // Note: is what event this plugin should fire

export default class ResolveWithSuffixFirstPlugin implements ResolvePlugin {
  private _options: Options;

  constructor(options: Options) {
    this._options = options;
  }

  apply(resolver: Resolver) {
    const target = resolver.ensureHook(TARGET_EVENT);
    const { suffix } = this._options;

    resolver
      .getHook(SOURCE_EVENT)
      .tapAsync(
        'ResolveWithSuffixFirstPlugin',
        (request, resolveContext, callback) => {
          const innerRequest = request.request || request.path;
          if (
            !innerRequest ||
            // Note: already resolve with suffix
            innerRequest.endsWith('.' + suffix) ||
            // Note: skip entry file
            !(request as ResolveRequest).context.issuer
          ) {
            return callback();
          }

          const attemptRequest = `${innerRequest}.${suffix}`;
          const isFileExist = this.testFileExistsSync(
            request.path as string,
            attemptRequest,
            [...resolver.options.extensions]
          );

          // Note: resolve without suffix
          if (!isFileExist) return callback();

          // Note: resolve with suffix
          var obj = {
            ...request,
            request: attemptRequest,
            relativePath:
              request.relativePath && `${request.relativePath}.${suffix}`
          };
          resolver.doResolve(
            target,
            obj,
            `resolve with suffix: ${attemptRequest}`,
            resolveContext,
            callback
          );
        }
      );
  }

  testFileExistsSync(
    path: string,
    attemptRequest: string,
    extensions: string[]
  ): boolean {
    for (let j = 0; j < extensions.length; j++) {
      const extension = extensions[j];
      const absolutePath = `${nodePath.resolve(
        path,
        attemptRequest
      )}${extension}`;

      if (fs.existsSync(absolutePath)) {
        return true;
      }
    }
    return false;
  }
}
