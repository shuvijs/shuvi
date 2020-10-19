import { MultiCompiler } from 'webpack';
import { SyncHook } from 'tapable';

type ExtractSyncHookGeneric<Type> = Type extends SyncHook<infer X> ? X : never;

declare module 'webpack' {
  type MultiStats = ExtractSyncHookGeneric<MultiCompiler['hooks']['done']>[0];
}
