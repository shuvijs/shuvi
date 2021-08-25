import { reactive } from './file-manager';

export interface UserModule {
  document: string | string[];
  server: string | string[];
  plugin: string | string[];
  app: string | string[];
  '404': string | string[];
}

export interface ApplicationModule {
  client: string;
  server: string;
}

// set at runtime-core
export interface RuntimeCoreModule {
  client: {
    application: string;
    history: string;
  };
  server: {
    application: string;
    entry: string;
  };
}

export type ShuviEntryModule = ApplicationModule;

export interface ProjectContext {
  entryCodes: string[];
  routesContent: string;
  apiRoutesContent: string;
  entryWrapperContent: string;
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
  runtimeCoreModule: RuntimeCoreModule;
  platformModule: string;
  userModule: UserModule;
}

export const createProjectContext = () =>
  reactive<ProjectContext>({
    entryCodes: [],
    routesContent: 'export default []',
    apiRoutesContent: 'export default []',
    entryWrapperContent: '',
    polyfills: [],
    services: new Map(),
    exports: new Map(),
    runtimePlugins: new Map(),
    runtimeConfigContent: null,
    runtimeCoreModule: {
      client: {
        application: '',
        history: ''
      },
      server: {
        application: '',
        entry: ''
      }
    },
    platformModule: '',
    userModule: {
      document: '',
      server: '',
      plugin: '',
      app: '',
      '404': ''
    }
  });
