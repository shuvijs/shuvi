import { rspack, ChunkGroup } from '@rspack/core';
export { RspackChain } from './config/base.rspack';
export { RspackDynamicDll } from './dynamic-dll/rspack-dynamic-dll';

// type ChunkGroup = Compilation['chunkGroups'][0];

export { rspack, ChunkGroup };

/**
 * re-export for shuvi plugin
 */
export {
  /**
   * @unsupported Rspack does not export validate.
   * TODO: Remove or replace after Rspack support is available.
   */
  // validate,
  /**
   * @unsupported Rspack does not export validateSchema.
   * TODO: Remove or replace after Rspack support is available.
   */
  // validateSchema,
  version,
  /**
   * @unsupported Rspack does not export cli.
   * TODO: Remove or replace after Rspack support is available.
   */
  // cli,
  ModuleFilenameHelpers,
  RuntimeGlobals,
  /**
   * @unsupported Rspack does not export UsageState.
   * TODO: Remove or replace after Rspack support is available.
   */
  // UsageState,
  /**
   * @unsupported Rspack does not export WebpackOptionsValidationError.
   * TODO: Remove or replace after Rspack support is available.
   */
  // WebpackOptionsValidationError,
  ValidationError,
  /**
   * @unsupported Rspack only supports cache as a boolean config, not as an export.
   * TODO: Remove or replace after Rspack support is available.
   */
  // cache,
  config,
  /**
   * @unsupported Rspack does not export dependencies.
   * TODO: Remove or replace after Rspack support is available.
   */
  // dependencies,
  /**
   * @unsupported Rspack does not export ids.
   * TODO: Remove or replace after Rspack support is available.
   */
  // ids,
  javascript,
  optimize,
  /**
   * @unsupported Rspack does not export runtime.
   * TODO: Remove or replace after Rspack support is available.
   */
  // runtime,
  /**
   * @unsupported Rspack does not export prefetch.
   * TODO: Remove or replace after Rspack support is available.
   */
  // prefetch,
  web,
  webworker,
  node,
  electron,
  wasm,
  library,
  container,
  sharing,
  /**
   * @unsupported Rspack does not export debug.
   * TODO: Remove or replace after Rspack support is available.
   */
  // debug,
  util,
  sources,
  experiments,
  WebpackPluginFunction,
  /** export */
  /**
   * @unsupported Rspack does not export AutomaticPrefetchPlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // AutomaticPrefetchPlugin,
  AsyncDependenciesBlock,
  BannerPlugin,
  /**
   * @unsupported Rspack does not export Cache.
   * TODO: Remove or replace after Rspack support is available.
   */
  // Cache,
  Chunk,
  /**
   * @unsupported Rspack does not export ChunkGraph.
   * TODO: Remove or replace after Rspack support is available.
   */
  // ChunkGraph,
  /**
   * @unsupported Rspack does not export CleanPlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // CleanPlugin,
  Compilation,
  Compiler,
  /**
   * @unsupported Rspack does not export ConcatenationScope.
   * TODO: Remove or replace after Rspack support is available.
   */
  // ConcatenationScope,
  /**
   * @unsupported Rspack does not export ContextExclusionPlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // ContextExclusionPlugin,
  ContextReplacementPlugin,
  DefinePlugin,
  /**
   * @unsupported Rspack does not export DelegatedPlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // DelegatedPlugin,
  Dependency,
  DllPlugin,
  DllReferencePlugin,
  DynamicEntryPlugin,
  EntryOptionPlugin,
  EntryPlugin,
  EnvironmentPlugin,
  EvalDevToolModulePlugin,
  EvalSourceMapDevToolPlugin,
  ExternalModule,
  ExternalsPlugin,
  /**
   * @unsupported Rspack does not export Generator.
   * TODO: Remove or replace after Rspack support is available.
   */
  // Generator,
  /**
   * @unsupported Rspack does not export HotUpdateChunk.
   * TODO: Remove or replace after Rspack support is available.
   */
  // HotUpdateChunk,
  HotModuleReplacementPlugin,
  IgnorePlugin,
  /**
   * @unsupported Rspack does not export JavascriptModulesPlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // JavascriptModulesPlugin,
  /**
   * @unsupported Rspack does not export LibManifestPlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // LibManifestPlugin,
  /**
   * @unsupported Rspack does not export LibraryTemplatePlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // LibraryTemplatePlugin,
  LoaderOptionsPlugin,
  LoaderTargetPlugin,
  Module,
  ModuleGraph,
  /**
   * @unsupported Rspack does not export ModuleGraphConnection.
   * TODO: Remove or replace after Rspack support is available.
   */
  // ModuleGraphConnection,
  NoEmitOnErrorsPlugin,
  NormalModule,
  NormalModuleReplacementPlugin,
  MultiCompiler,
  /**
   * @unsupported Rspack does not export Parser.
   * TODO: Remove or replace after Rspack support is available.
   */
  // Parser,
  Plugin,
  /**
   * @unsupported Rspack does not export PrefetchPlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // PrefetchPlugin,
  ProgressPlugin,
  ProvidePlugin,
  RuntimeModule,
  EntryPlugin as SingleEntryPlugin,
  SourceMapDevToolPlugin,
  Stats,
  Template,
  /**
   * @unsupported Rspack does not export WatchIgnorePlugin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // WatchIgnorePlugin,
  WebpackError,
  WebpackOptionsApply,
  /**
   * @unsupported Rspack does not export WebpackOptionsDefaulter.
   * TODO: Remove or replace after Rspack support is available.
   */
  // WebpackOptionsDefaulter,
  Entry,
  EntryNormalized,
  EntryObject,
  LibraryOptions,
  ModuleOptions,
  ResolveOptions,
  RuleSetCondition,
  /**
   * @unsupported Rspack does not export RuleSetConditionAbsolute.
   * TODO: Remove or replace after Rspack support is available.
   */
  // RuleSetConditionAbsolute,
  RuleSetRule,
  RuleSetUse,
  RuleSetUseItem,
  Configuration,
  /**
   * @unsupported Rspack does not export WebpackOptionsNormalized.
   * TODO: Remove or replace after Rspack support is available.
   */
  // WebpackOptionsNormalized,
  WebpackPluginInstance,
  Asset,
  AssetInfo,
  MultiStats,
  /**
   * @unsupported Rspack does not export ParserState.
   * TODO: Remove or replace after Rspack support is available.
   */
  // ParserState,
  Watching,
  StatsAsset,
  StatsChunk,
  /**
   * @unsupported Rspack does not export StatsChunkGroup.
   * TODO: Remove or replace after Rspack support is available.
   */
  // StatsChunkGroup,
  /**
   * @unsupported Rspack does not export StatsChunkOrigin.
   * TODO: Remove or replace after Rspack support is available.
   */
  // StatsChunkOrigin,
  StatsCompilation,
  StatsError,
  /**
   * @unsupported Rspack does not export StatsLogging.
   * TODO: Remove or replace after Rspack support is available.
   */
  // StatsLogging,
  /**
   * @unsupported Rspack does not export StatsLoggingEntry.
   * TODO: Remove or replace after Rspack support is available.
   */
  // StatsLoggingEntry,
  StatsModule // StatsModuleIssuer,
} from /**
 * @unsupported Rspack does not export StatsModuleIssuer.
 * TODO: Remove or replace after Rspack support is available.
 */
/**
 * @unsupported Rspack does not export StatsModuleReason.
 * TODO: Remove or replace after Rspack support is available.
 */
// StatsModuleReason,
/**
 * @unsupported Rspack does not export StatsModuleTraceDependency.
 * TODO: Remove or replace after Rspack support is available.
 */
// StatsModuleTraceDependency,
/**
 * @unsupported Rspack does not export StatsModuleTraceItem.
 * TODO: Remove or replace after Rspack support is available.
 */
// StatsModuleTraceItem,
/**
 * @unsupported Rspack does not export StatsProfile.
 * TODO: Remove or replace after Rspack support is available.
 */
// StatsProfile
'@rspack/core';
