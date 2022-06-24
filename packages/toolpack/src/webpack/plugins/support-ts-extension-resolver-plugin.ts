import { Resolver } from 'webpack';

export default class SupportTsExtensionResolverPlugin {
  apply(resolver: Resolver) {
    const exts = ['.tsx', '.ts'];
    const target = resolver.ensureHook('file');
    exts.forEach(ext => {
      resolver
        .getHook('raw-file')
        .tapAsync(
          'SupportTsExtensionResolverPlugin',
          (request, resolveContext, callback) => {
            const { relativePath } = request;
            if (relativePath) {
              if (/\.shuvi\/(runtime|app)/.test(relativePath)) {
                const newRequest = {
                  ...request,
                  path: request.path + ext,
                  relativePath:
                    request.relativePath && request.relativePath + ext
                };
                return resolver.doResolve(
                  target,
                  newRequest,
                  ext,
                  resolveContext,
                  callback
                );
              }
            }
            return callback();
          }
        );
    });
  }
}
