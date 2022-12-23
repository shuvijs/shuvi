import {
  createSyncWaterfallHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  createAsyncParallelHook,
  IPluginInstance,
  IPluginHandlers
} from '@shuvi/hook';
import { createPluginCreator } from '@shuvi/shared/lib/plugins';
import { FileOptionWithId } from '../project/index';
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
} from './pluginTypes';
import { ShuviConfig, IPluginContext, CustomCorePluginHooks } from './apiTypes';

const extendConfig = createSyncWaterfallHook<ShuviConfig>();
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
  FileOptionWithId<any> | FileOptionWithId<any>[]
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

export * from './pluginTypes';

type BuiltinPluginHooks = typeof builtinPluginHooks;

export interface PluginHooks
  extends BuiltinPluginHooks,
    CustomCorePluginHooks {}

export type CorePluginInstance = IPluginInstance<PluginHooks, IPluginContext>;

export type CorePluginConstructor = IPluginHandlers<
  PluginHooks,
  IPluginContext
>;

export type CorePluginFactory = (options: any) => CorePluginInstance;

export const getManager = () =>
  createHookManager<PluginHooks, IPluginContext>(
    builtinPluginHooks as PluginHooks
  );

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

export const { createPluginBefore, createPlugin, createPluginAfter } =
  createPluginCreator<PluginHooks, IPluginContext>();
