import type { Compiler, Stats } from '@rspack/core';
import {
  getModuleCollector,
  ModuleCollector,
  ModuleCollectorOptions,
  ModuleSnapshot
} from '../moduleCollector';

export type SnapshotListener = (snapshot: ModuleSnapshot) => void;

export interface RspackDynamicDLLPluginOptions {
  resolveRspackModule: (s: string) => ReturnType<typeof require>;
  dllName: string;
  onSnapshot: SnapshotListener;
  shareScope?: string;
}

const PLUGIN_NAME = 'RspackDLLBuildDeps';

export class RspackDynamicDLLPlugin {
  private _collector!: ModuleCollector;
  private _dllName: string;
  private _timer: null | ReturnType<typeof setTimeout>;
  private _matchCache: Map<string, string>;
  private _onSnapshot: SnapshotListener;
  private _disabled: boolean;

  constructor(opts: RspackDynamicDLLPluginOptions & ModuleCollectorOptions) {
    this._dllName = opts.dllName;
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

        // Check cache first
        const replaceValue = this._matchCache.get(request);
        if (replaceValue) {
          resolveData.request = replaceValue;
          return;
        }

        // For beforeResolve, we can't use full ModuleCollector logic since we don't have resource yet
        // So we'll do a basic check for node_modules requests and let createModule handle the rest
        if (
          !this._disabled &&
          request &&
          !request.startsWith('.') &&
          !request.startsWith('/')
        ) {
          // Basic check: if it looks like a node_modules request, we'll redirect it
          // The actual filtering will happen in createModule
          const name = this._dllName;
          const dllRequest = `${name}/${request}`;
          resolveData.request = dllRequest;
          this._matchCache.set(request, dllRequest);
        }
      });

      nmf.hooks.createModule.tap(
        PLUGIN_NAME,
        (_createData: any, resolveData: any) => {
          const createData = resolveData?.createData || {};
          const request = resolveData?.request || '';
          const resource = createData?.resource || '';
          const context = resolveData?.context || '';

          if (
            !this._collector.shouldCollect({
              request,
              context,
              resource
            })
          ) {
            return;
          }

          const resourceResolveData = createData?.resourceResolveData || {};
          const descriptionFileData =
            resourceResolveData?.descriptionFileData || {};
          const version = descriptionFileData?.version || null;

          this._collector.add(request, {
            libraryPath: resource,
            version
          });
          if (this._disabled) {
            return;
          }

          const name = this._dllName;
          const replaceValue = `${name}/${request}`;
          if (resolveData?.request !== undefined) {
            resolveData.request = replaceValue;
          }
          this._matchCache.set(request, replaceValue);

          // For Rspack, we'll use Module Federation approach rather than RemoteModule
          // The actual module federation is handled by the MF plugin in the config
          return undefined; // Let Rspack handle the module creation
        }
      );
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
