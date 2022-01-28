import {
  createSyncBailHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  createAsyncParallelHook,
  HookMap
} from '@shuvi/hook';
import WebpackChain from 'webpack-chain';
import {
  UserModule,
  TargetModule,
  FileOptions,
  fileSnippets,
  createFile
} from '../project';
import {
  ExtraTargetAssistant,
  ConfigWebpackAssistant,
  TargetChain,
  BundlerDoneExtra,
  BundlerTargetDoneExtra,
  RuntimeService,
  Resources
} from './pluginTypes';
import {
  UserConfig,
  IPluginContext,
  IPhase,
  IRuntimeOrServerPlugin
} from './apiTypes';

export * from './pluginTypes';

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

export type CreatePlugin = PluginManager['createPlugin'];

export type ICliPluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;

export type ICliPluginConstructor = ArrayItem<
  Parameters<PluginManager['createPlugin']>[0]
>;

const config = createAsyncParallelHook<UserConfig, IPhase, UserConfig>();
const appReady = createAsyncParallelHook<void>();
const bundlerDone = createAsyncParallelHook<BundlerDoneExtra>();
const bundlerTargetDone = createAsyncParallelHook<BundlerTargetDoneExtra>();
const configWebpack = createAsyncSeriesWaterfallHook<
  WebpackChain,
  ConfigWebpackAssistant
>();
const destroy = createAsyncParallelHook<void>();
const afterBuild = createAsyncParallelHook<void>();
const extraTarget = createAsyncParallelHook<
  ExtraTargetAssistant,
  void,
  TargetChain
>();
const runtimePlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IRuntimeOrServerPlugin | IRuntimeOrServerPlugin[]
>();
const serverPlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IRuntimeOrServerPlugin | IRuntimeOrServerPlugin[]
>();
const afterInit = createAsyncParallelHook<void>();
const platformModule = createSyncBailHook<void, void, string>();
const clientModule = createSyncBailHook<void, void, TargetModule>();
const userModule = createSyncBailHook<void, void, UserModule>();
const addResource = createAsyncParallelHook<
  void,
  void,
  Resources | Resources[]
>();
const appPolyfill = createAsyncParallelHook<void, void, string | string[]>();

export interface AppRuntimeFileUtils {
  fileSnippets: fileSnippets.FileSnippets
  createFile: typeof createFile
}

const appRuntimeFile = createAsyncParallelHook<
  void,
  AppRuntimeFileUtils,
  FileOptions | FileOptions[]
>();
const appEntryCode = createAsyncParallelHook<void, void, string | string[]>();
const runtimeService = createAsyncParallelHook<
  void,
  void,
  RuntimeService | RuntimeService[]
>();

const internalPluginHooks = {
  config,
  appReady,
  bundlerDone,
  bundlerTargetDone,
  configWebpack,
  destroy,
  afterBuild,
  extraTarget,
  runtimePlugin,
  serverPlugin,
  afterInit,
  platformModule,
  clientModule,
  userModule,
  addResource,
  appPolyfill,
  appRuntimeFile,
  appEntryCode,
  runtimeService
};

export type InternalPluginHooks = typeof internalPluginHooks

export interface PluginHooks extends HookMap {}

export const getManager = () =>
  createHookManager<InternalPluginHooks, IPluginContext, PluginHooks>(internalPluginHooks);

export const { createPlugin } = getManager();
