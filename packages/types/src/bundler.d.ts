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

export interface IManifest {
  entries: {
    [s: string]: IAssetMap;
  };
  routes: {
    [s: string]: IAssetMap;
  };
  chunks: {
    [s: string]: string;
  };
  loadble: {
    [s: string]: IModule;
  };
}
