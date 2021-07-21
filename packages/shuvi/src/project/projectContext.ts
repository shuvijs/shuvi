import { reactive } from '../file-manager';

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
  routesContent: string;
  routesNormalizer: string;
  polyfills: string[];
  runtimePlugins: Map<string, string>;
  runtimeConfigContent: string | null;
  userModule: UserModule;
}

export const createProjectContext = () =>
  reactive<ProjectContext>({
    viewModule: '',
    appModule: [],
    pluginModule: [],
    entryCodes: [],
    entryFileContent: '',
    routesContent: 'export default []',
    routesNormalizer: '',
    polyfills: [],
    runtimePlugins: new Map(),
    runtimeConfigContent: null,
    userModule: {
      document: '',
      server: '',
      plugin: '',
      app: '',
      '404': ''
    }
  });
