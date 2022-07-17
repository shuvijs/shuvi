import {
  createSyncWaterfallHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  createAsyncParallelHook,
  IPluginInstance,
  IPluginHandlers
} from '@shuvi/hook';
import { CustomCorePluginHooks } from '@shuvi/runtime';

import { FileOptions } from '../project';
import {
  ExtraTargetAssistant,
  ConfigWebpackAssistant,
  TargetChain,
  BundlerDoneExtra,
  BundlerTargetDoneExtra,
  RuntimeService,
  Resources,
  AddRuntimeFileUtils,
  WebpackChainType
} from './lifecycleTypes';
import { Config, IPluginContext } from './apiTypes';

const extendConfig = createSyncWaterfallHook<Config>();
const afterInit = createAsyncParallelHook<void>();
const afterBuild = createAsyncParallelHook<void>();
const afterDestroy = createAsyncParallelHook<void>();
const afterBundlerDone = createAsyncParallelHook<BundlerDoneExtra>();
const afterBundlerTargetDone =
  createAsyncParallelHook<BundlerTargetDoneExtra>();
const configWebpack = createAsyncSeriesWaterfallHook<
  WebpackChainType,
  ConfigWebpackAssistant
>();
const addExtraTarget = createAsyncParallelHook<
  ExtraTargetAssistant,
  void,
  TargetChain
>();
const addResource = createAsyncParallelHook<
  void,
  void,
  Resources | Resources[]
>();

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

const builtinPluginHooks = {
  extendConfig,
  afterInit,
  afterBuild,
  afterDestroy,
  afterBundlerDone,
  afterBundlerTargetDone,
  configWebpack,
  addExtraTarget,
  addResource,
  addRuntimeFile,
  addRuntimeService
};

export * from './lifecycleTypes';

type BuiltinPluginHooks = typeof builtinPluginHooks;

export type CorePluginInstance = IPluginInstance<
  BuiltinPluginHooks & CustomCorePluginHooks,
  IPluginContext
>;

export type CorePluginConstructor = IPluginHandlers<
  BuiltinPluginHooks & CustomCorePluginHooks,
  IPluginContext
>;
export const getManager = () =>
  createHookManager<BuiltinPluginHooks, IPluginContext, CustomCorePluginHooks>(
    builtinPluginHooks
  );

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

export const { createPlugin } = getManager();
