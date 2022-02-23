import { reactive } from './file-manager';
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
  resources: Map<string, Map<string, string | undefined>>;
}

export const createProjectContext = () =>
  reactive<ProjectContext>({
    runtimeServices: new Map(),
    resources: new Map()
  });
