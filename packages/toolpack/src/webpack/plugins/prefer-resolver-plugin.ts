interface Options {
  suffix: string;
}

export default class PreferResolverPlugin {
  private _options: Options;

  constructor(options: Options) {
    this._options = options;
  }

  apply(resolver: any) {
    const target = resolver.ensureHook('resolve');
    const { suffix } = this._options;
    resolver
      .getHook('described-resolve')
      .tapAsync(
        'FileExistsPlugin',
        (request: any, resolveContext: any, callback: any) => {
          const innerRequest = request.request || request.path;
          if (!innerRequest) return callback();
          if (innerRequest.endsWith('.' + suffix)) {
            return callback();
          }

          const suffixList = [suffix];
          const resolveWithPrefer = (append: string, cb: any) => {
            const obj = {
              ...request,
              request: innerRequest + '.' + append,
              relativePath:
                request.relativePath && request.relativePath + '.' + append,
            };
            return resolver.doResolve(
              target,
              obj,
              'resolve with prefer request',
              resolveContext,
              (err: any, result: any) => {
                if (err) return cb(err);
                if (result) return cb(null, result);
                return cb();
              }
            );
          };

          const next = (err: any, result?: any) => {
            if (err) {
              return callback(err);
            }

            if (result) {
              return callback(err, result);
            }

            const nextSuffix = suffixList.pop();
            if (!nextSuffix) {
              return callback();
            }
            resolveWithPrefer(nextSuffix, next);
          };

          next(null);
        }
      );
  }
}
