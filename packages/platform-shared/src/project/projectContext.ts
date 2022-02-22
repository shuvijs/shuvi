import { IPlugin } from '@shuvi/service/lib/core';

export interface UserModule {
  runtime: string | string[];
  app: string | string[];
  error: string | string[];
}

export interface ProjectContext {
  entryCodes: string[];
  polyfills: string[];
  runtimePlugins: IPlugin[];
  runtimeConfigContent: string | null;
  platformModule: string;
  userModule: UserModule;
}

export const createProjectContext = (): ProjectContext => {
  return {
    entryCodes: [],
    polyfills: [],
    runtimePlugins: [],
    runtimeConfigContent: null,
    platformModule: '',
    userModule: {
      runtime: '',
      app: '',
      error: ''
    }
  };
};
