import { IPlugin, IRuntimeConfig } from '@shuvi/service/lib/core';

export interface UserModule {
  runtime: string | string[];
  app: string | string[];
  error: string | string[];
}

export interface ProjectContext {
  entryCodes: string[];
  polyfills: string[];
  runtimePlugins: IPlugin[];
  runtimeConfig: IRuntimeConfig;
  platformModule: string;
  userModule: UserModule;
}

export const createProjectContext = (): ProjectContext => {
  return {
    entryCodes: [],
    polyfills: [],
    runtimePlugins: [],
    runtimeConfig: {},
    platformModule: '',
    userModule: {
      runtime: '',
      app: '',
      error: ''
    }
  };
};
