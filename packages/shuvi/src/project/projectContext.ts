import { reactive } from './file-manager';

export interface UserModule {
  document: string | string[];
  server: string | string[];
  plugin: string | string[];
  app: string | string[];
  '404': string | string[];
}

export interface ProjectContext {
  viewModule: string;
  appModule: string | string[];
  pluginModule: string | string[];
  entryCodes: string[];
  entryFileContent: string;
  pageRoutesContent: string;
  polyfills: string[];

  /**
   * services:
   * {
   *   [namespace: string]: {
   *     [module: string]: string[] // exported list
   *   }
   * }
   */
  services: Map<string, Map<string, Set<string>>>;
  exports: Map<string, string[]>;
  runtimePlugins: Map<string, string>;
  runtimeConfigContent: string | null;
  platformDir: string;
  userModule: UserModule;
}

export const createProjectContext = () =>
  reactive<ProjectContext>({
    viewModule: '',
    appModule: [],
    pluginModule: [],
    entryCodes: [],
    entryFileContent: '',
    pageRoutesContent: 'export default []',
    polyfills: [],
    services: new Map(),
    exports: new Map(),
    runtimePlugins: new Map(),
    runtimeConfigContent: null,
    platformDir: '',
    userModule: {
      document: '',
      server: '',
      plugin: '',
      app: '',
      '404': ''
    }
  });
