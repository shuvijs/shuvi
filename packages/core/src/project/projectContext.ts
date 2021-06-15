import { reactive } from '../file-manager';

export interface ProjectContext {
  viewModule: string;
  appModule: string | string[];
  pluginModule: string | string[];
  entryCodes: string[];
  entryFileContent: string;
  routesContent: string;
  polyfills: string[];
  exports: Map<string, string[]>;
  runtimePlugins: Map<string, string>;
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
    exports: new Map(),
    runtimePlugins: new Map()
  });
