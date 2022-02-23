import {
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
  Resources
} from './pluginTypes';
import { IPluginContext, IPlugin } from './apiTypes';

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
const addExtraTarget = createAsyncParallelHook<
  ExtraTargetAssistant,
  void,
  TargetChain
>();
const addServerPlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IPlugin | IPlugin[]
>();
const addResource = createAsyncParallelHook<
  void,
  void,
  Resources | Resources[]
>();

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

const internalPluginHooks = {
  afterInit,
  afterBuild,
  afterDestroy,
  afterBundlerDone,
  afterBundlerTargetDone,
  configWebpack,
  addExtraTarget,
  addServerPlugin,
  addResource,
  addRuntimeFile,
  addRuntimeService
};

export type InternalPluginHooks = typeof internalPluginHooks;

export interface PluginHooks extends HookMap {}

export const getManager = () =>
  createHookManager<InternalPluginHooks, IPluginContext, PluginHooks>(
    internalPluginHooks
  );

export const { createPlugin } = getManager();
