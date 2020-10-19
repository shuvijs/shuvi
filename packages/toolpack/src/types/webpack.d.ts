import webpack, { Compiler, ResolveOptions, Compilation } from 'webpack';
import * as webpack4 from '@types/webpack';

declare module 'webpack' {
  namespace loader {
    type Loader = webpack4.loader.Loader;
    type LoaderContext = webpack4.loader.LoaderContext;
  }

  declare interface Plugin {
    apply(compiler: Compiler): void;
  }

  type Resolver = Required<ResolveOptions>['resolver'];
  declare interface ResolvePlugin {
    apply: (resolver: Resolver) => void;
  }

  type ChunkGroup = Compilation['chunkGroups'][0];
}
