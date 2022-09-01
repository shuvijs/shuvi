import { promises as fs } from 'fs';
import { sources, Compiler, Compilation } from 'webpack';
import * as loaderUtils from 'loader-utils';

const PLUGIN_NAME = 'CopyFilePlugin';

export class CopyFilePlugin {
  private filePath: string;
  private name: string;
  private cacheKey: string;
  private info?: object;

  constructor({
    filePath,
    cacheKey,
    name,
    info
  }: {
    filePath: string;
    cacheKey: string;
    name: string;
    info?: object;
  }) {
    this.filePath = filePath;
    this.cacheKey = cacheKey;
    this.name = name;
    this.info = info;
  }

  apply(compiler: Compiler) {
    // compiler.options.output.filename
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        const cache = compilation.getCache('CopyFilePlugin');
        const hook = compilation.hooks.processAssets;
        hook.tapPromise(
          {
            name: PLUGIN_NAME,
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
          },
          async () => {
            if (cache) {
              const cachedResult: any = await cache.getPromise(
                this.filePath,
                this.cacheKey
              );
              if (cachedResult) {
                const { file, source } = cachedResult;
                compilation.emitAsset(file, source, {
                  ...this.info
                });
                return;
              }
            }
            const content = await fs.readFile(this.filePath, 'utf8');
            const hash = loaderUtils.interpolateName(
              {
                // we only care about hash, so use a fake path is ok
                resourcePath: '/fake/path'
              } as any,
              '[hash:8]',
              {
                content
              }
            );
            const file = compilation.getAssetPath(
              compiler.options.output.filename || this.name,
              {
                contentHash: hash,
                chunk: { id: this.name, name: this.name }
              } as any
            );

            const source = new sources.RawSource(content);
            if (cache) {
              await cache.storePromise(this.filePath, this.cacheKey, {
                file,
                source
              });
            }

            compilation.emitAsset(file, source, {
              ...this.info
            });
          }
        );
      }
    );
  }
}
