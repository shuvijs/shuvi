import { RuntimePluginConfig } from '../core';

export interface ProjectContext {
  /**
   * services:
   * {
   *   [namespace: string]: {
   *     [module: string]: string[] // exported list
   *   }
   * }
   */
  runtimeServices: Map<string, Map<string, Set<string>>>;
  resources: Map<string, string | undefined>;
  runtimePlugins: RuntimePluginConfig[];
  typeDeclarationFiles: string[];
}

export const createProjectContext: () => ProjectContext = () => ({
  runtimeServices: new Map(),
  resources: new Map(),
  runtimePlugins: [],
  typeDeclarationFiles: []
});
