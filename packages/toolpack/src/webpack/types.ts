import WebpackChain from 'webpack-chain';

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
  entries: {
    [s: string]: IAssetMap;
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

export interface IWebpackHelpers {
  addExternals: (chain: WebpackChain, externalsFn: ExternalsFunction) => void;
}
