import {
  createAsyncSeriesWaterfallHook,
  createHookManager,
  createAsyncParallelHook,
  IPluginInstance
} from '@shuvi/hook';
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
  PluginHooks,
  WebpackChainType
} from './lifecycleTypes';
import { IPluginContext, IPlugin } from './apiTypes';

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

export * from './lifecycleTypes';

type BuiltinPluginHooks = typeof builtinPluginHooks;

export type PluginInstance = IPluginInstance<
  BuiltinPluginHooks & PluginHooks,
  IPluginContext
>;

export const getManager = () =>
  createHookManager<BuiltinPluginHooks, IPluginContext, PluginHooks>(
    builtinPluginHooks
  );

export type PluginManager = ReturnType<typeof getManager>;

export const { createPlugin } = getManager();
