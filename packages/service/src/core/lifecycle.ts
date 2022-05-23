import {
  createAsyncSeriesWaterfallHook,
  createHookManager,
  createAsyncParallelHook,
  IPluginInstance,
  IPluginHandlers,
  HookMap
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
import { IPluginContext } from './apiTypes';

const afterInit = createAsyncParallelHook<void>();
const afterShuviAppBuild = createAsyncParallelHook<void>();
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
  afterInit,
  afterShuviAppBuild,
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

export interface PluginHooks extends HookMap {}

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
