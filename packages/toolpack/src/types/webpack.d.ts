import webpack, { Compiler, ResolveOptions, Compilation } from 'webpack';
import * as webpack4 from '@types/webpack';
import { AsyncSeriesHook } from 'tapable';

type ExtractAsyncSeriesHookGeneric<Type> = Type extends AsyncSeriesHook<infer X>
  ? X
  : never;

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

  type ResolveRequest = ExtractAsyncSeriesHookGeneric<
    Resolver['hooks']['result']
  >[0] & { context: { issuer: string; compiler?: string } };
}
