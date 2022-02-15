import {
  createSyncWaterfallHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  createAsyncParallelHook,
  HookMap
} from '@shuvi/hook';
import WebpackChain from 'webpack-chain';
import { createFile, fileUtils, FileOptions } from '../project';
import {
  ExtraTargetAssistant,
  ConfigWebpackAssistant,
  TargetChain,
  BundlerDoneExtra,
  BundlerTargetDoneExtra,
  RuntimeService,
  Resources,
  IRuntimeConfig
} from './pluginTypes';
import { IPluginContext, IRuntimeOrServerPlugin } from './apiTypes';

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

const afterInit = createAsyncParallelHook<void>();
const afterBuild = createAsyncParallelHook<void>();
const afterDestroy = createAsyncParallelHook<void>();
const afterBundlerDone = createAsyncParallelHook<BundlerDoneExtra>();
const afterBundlerTargetDone =
  createAsyncParallelHook<BundlerTargetDoneExtra>();
const configWebpack = createAsyncSeriesWaterfallHook<
  WebpackChain,
  ConfigWebpackAssistant
>();
const modifyAsyncEntry = createSyncWaterfallHook<boolean>();
const modifyRuntimeConfig = createAsyncSeriesWaterfallHook<
  IRuntimeConfig,
  void
>();
const addExtraTarget = createAsyncParallelHook<
  ExtraTargetAssistant,
  void,
  TargetChain
>();
const addRuntimePlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IRuntimeOrServerPlugin | IRuntimeOrServerPlugin[]
>();
const addServerPlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IRuntimeOrServerPlugin | IRuntimeOrServerPlugin[]
>();
const addResource = createAsyncParallelHook<
  void,
  void,
  Resources | Resources[]
>();
const addPolyfill = createAsyncParallelHook<void, void, string | string[]>();

type AddRuntimeFileUtils = {
  createFile: typeof createFile;
  getAllFiles: typeof fileUtils.getAllFiles;
};

const addRuntimeFile = createAsyncParallelHook<
  void,
  AddRuntimeFileUtils,
  FileOptions | FileOptions[]
>();

const addRuntimeService = createAsyncParallelHook<
  void,
  void,
  RuntimeService | RuntimeService[]
>();
const addEntryCode = createAsyncParallelHook<void, void, string | string[]>();

const internalPluginHooks = {
  afterInit,
  afterBuild,
  afterDestroy,
  afterBundlerDone,
  afterBundlerTargetDone,
  configWebpack,
  modifyAsyncEntry,
  modifyRuntimeConfig,
  addExtraTarget,
  addRuntimePlugin,
  addServerPlugin,
  addResource,
  addPolyfill,
  addRuntimeFile,
  addRuntimeService,
  addEntryCode
};

export type InternalPluginHooks = typeof internalPluginHooks;

export interface PluginHooks extends HookMap {}

export const getManager = () =>
  createHookManager<InternalPluginHooks, IPluginContext, PluginHooks>(
    internalPluginHooks
  );

export const { createPlugin } = getManager();
