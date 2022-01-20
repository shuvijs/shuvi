import { reactive } from './file-manager';
import { IRuntimeOrServerPlugin } from '../core';
export interface UserModule {
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
  runtimeServices: Map<string, Map<string, Set<string>>>;
  resources: Map<string, Map<string, string | undefined>>;
  runtimePlugins: IRuntimeOrServerPlugin[];
  runtimeConfigContent: string | null;
  platformModule: string;
  userModule: UserModule;
  clientModule: TargetModule;
}

export const createProjectContext = () =>
  reactive<ProjectContext>({
    entryCodes: [],
    entryWrapperContent: '',
    polyfills: [],
    runtimeServices: new Map(),
    resources: new Map(),
    runtimePlugins: [],
    runtimeConfigContent: null,
    clientModule: {
      application: '',
      entry: ''
    },
    platformModule: '',
    userModule: {
      runtime: '',
      app: '',
      error: ''
    }
  });
