import { reactive } from './file-manager';
import { IRuntimeOrServerPlugin } from '../core';
export interface UserModule {
  document: string | string[];
  server: string | string[];
  runtime: string | string[];
  app: string | string[];
  error: string | string[];
}

export interface ApplicationModule {
  client: string;
  server: string;
}

export interface TargetModule {
  application: string;
  entry: string;
}

export type ShuviEntryModule = ApplicationModule;

export interface ProjectContext {
  entryCodes: string[];
  routesContent: string;
  apiRoutesContent: string;
  middlewareRoutesContent: string;
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
  runtimePlugins: IRuntimeOrServerPlugin[];
  runtimeConfigContent: string | null;
  platformModule: string;
  userModule: UserModule;
  clientModule: TargetModule;
}

export const createProjectContext = () =>
  reactive<ProjectContext>({
    entryCodes: [],
    routesContent: 'export default []',
    apiRoutesContent: 'export default []',
    middlewareRoutesContent: 'export default []',
    entryWrapperContent: '',
    polyfills: [],
    services: new Map(),
    exports: new Map(),
    runtimePlugins: [],
    runtimeConfigContent: null,
    clientModule: {
      application: '',
      entry: ''
    },
    platformModule: '',
    userModule: {
      document: '',
      server: '',
      runtime: '',
      app: '',
      error: ''
    }
  });
