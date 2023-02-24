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
    [s: string]: IModule | undefined;
  };
}
