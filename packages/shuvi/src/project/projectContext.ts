import { FileOptions, reactive } from './file-manager';

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
  polyfills: string[];
  services: Array<
    [(options: FileOptions) => void, string, string, string, boolean]
  >; // message queue
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
    routesContent: 'export default []',
    polyfills: [],
    services: [],
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
