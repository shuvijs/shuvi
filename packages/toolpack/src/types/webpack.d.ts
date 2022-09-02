import webpack, { Compiler, ResolveOptions, Compilation } from 'webpack/types';

declare module 'webpack' {
  declare interface Plugin {
    apply(compiler: Compiler): void;
  }

  type Resolver = Required<ResolveOptions>['resolver'];
  declare interface ResolvePlugin {
    apply: (resolver: Resolver) => void;
  }

  type ChunkGroup = Compilation['chunkGroups'][0];
}
