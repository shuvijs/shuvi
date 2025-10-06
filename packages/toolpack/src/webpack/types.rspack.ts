import { RspackChain } from './config/base.rspack';
export interface IModuleItem {
  id: string;
  name: string;
}

export interface IModule {
  files: string[];
  children: IModuleItem[];
}

export type IAssetMap = {
  js: string[];
  css?: string[];
} & {
  [ext: string]: string[];
};

export interface IChunk {
  file: string;
  request: string;
}

export interface IManifest {
  // client only
  polyfillFiles?: string[];

  entries: {
    [s: string]: IAssetMap; // name => assets
  };
  bundles: {
    [name: string]: string; // name => file
  };
  chunkRequest: {
    [file: string]: string; // file => request
  };
  loadble: {
    [s: string]: IModule;
  };
}

export type ExternalsFunction = (
  data: { context: string; request: string },
  callback: (err: Error | null, result: string | undefined) => void
) => void;

/**
 * @unsupported Rspack externals API is not fully compatible with Webpack's externals function signature and plugin ecosystem.
 * TODO: Update or shim when Rspack exposes full externals support or a compatible API.
 */
export interface IWebpackHelpers {
  addExternals: (chain: RspackChain, externalsFn: ExternalsFunction) => void;
}
