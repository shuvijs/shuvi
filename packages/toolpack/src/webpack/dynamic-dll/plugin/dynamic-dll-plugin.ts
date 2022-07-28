import type { Compiler, Stats } from 'webpack';
import {
  getModuleCollector,
  ModuleCollector,
  ModuleCollectorOptions,
  ModuleSnapshot
} from '../moduleCollector';

export type SnapshotListener = (snapshot: ModuleSnapshot) => void;

export interface DynamicDLLPluginOptions {
  //collector: ModuleCollector;
  resolveWebpackModule: (s: string) => ReturnType<typeof require>;
  dllName: string;
  onSnapshot: SnapshotListener;
  shareScope?: string;
}

const PLUGIN_NAME = 'DLLBuildDeps';

export class DynamicDLLPlugin {
  private _collector!: ModuleCollector;
  private _resolveWebpackModule: (s: string) => ReturnType<typeof require>;
  private _dllName: string;
  private _shareScope?: string;
  private _timer: null | ReturnType<typeof setTimeout>;
  private _matchCache: Map<string, string>;
  private _onSnapshot: SnapshotListener;
  private _disabled: boolean;

  constructor(opts: DynamicDLLPluginOptions & ModuleCollectorOptions) {
    this._resolveWebpackModule = opts.resolveWebpackModule;
    this._dllName = opts.dllName;
    this._shareScope = opts.shareScope;
    this._onSnapshot = opts.onSnapshot;
    this._collector = getModuleCollector({
      include: opts.include,
      exclude: opts.exclude
    });
    this._matchCache = new Map();
    this._timer = null;
    this._disabled = false;
  }

  disableDllReference() {
    this._disabled = true;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, nmf => {
      nmf.hooks.beforeResolve.tap(PLUGIN_NAME, resolveData => {
        const { request } = resolveData;

        const replaceValue = this._matchCache.get(request);

        if (replaceValue) {
          resolveData.request = replaceValue;
        }
      });

      nmf.hooks.createModule.tap(PLUGIN_NAME, (_createData, resolveData) => {
        const { createData = {}, request } = resolveData;
        const { resource = '' } = createData;
        if (
          !this._collector.shouldCollect({
            request,
            context: resolveData.context,
            resource
          })
        ) {
          return;
        }

        const {
          resourceResolveData: { descriptionFileData: { version = null } } = {}
        } = createData;
        this._collector.add(request, {
          libraryPath: resource,
          version
        });
        if (this._disabled) {
          return;
        }

        const name = this._dllName;
        const replaceValue = `${name}/${request}`;
        resolveData.request = replaceValue;
        this._matchCache.set(request, replaceValue);
        const RemoteModule: any = this._resolveWebpackModule(
          `webpack/lib/container/RemoteModule`
        );
        return new RemoteModule(
          resolveData.request,
          [`webpack/container/reference/${name}`],
          `.${resolveData.request.slice(name.length)}`,
          this._shareScope || 'default'
        );
      });
    });

    compiler.hooks.done.tap(PLUGIN_NAME, (stats: Stats) => {
      if (!stats.hasErrors()) {
        if (this._timer) {
          clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {
          this._onSnapshot(this._collector.snapshot());
        }, 500);
      }
    });
  }
}
