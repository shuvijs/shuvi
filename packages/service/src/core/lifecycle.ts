import {
  createAsyncSeriesWaterfallHook,
  createHookManager,
  createAsyncParallelHook
} from '@shuvi/hook';
import WebpackChain from 'webpack-chain';
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
  PluginHooks
} from './lifecycleTypes';
import { IPluginContext, IPlugin } from './apiTypes';

export * from './lifecycleTypes';

export type PluginManager = ReturnType<typeof getManager>;

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

type BuiltinPluginHooks = typeof builtinPluginHooks;

export const getManager = () =>
  createHookManager<BuiltinPluginHooks, IPluginContext, PluginHooks>(
    builtinPluginHooks
  );

export const { createPlugin } = getManager();
