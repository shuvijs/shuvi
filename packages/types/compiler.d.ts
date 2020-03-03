export interface ModuleItem {
  id: string;
  name: string;
}

export interface Module {
  files: string[];
  children: ModuleItem[];
}

export type AssetMap = {
  js: string[];
  css?: string[];
} & {
  [ext: string]: string[];
};

export interface Manifest {
  entries: {
    [s: string]: AssetMap;
  };
  routes: {
    [s: string]: AssetMap;
  };
  chunks: {
    [s: string]: string;
  };
  loadble: {
    [s: string]: Module;
  };
}
