import { IRuntimeConfig } from '../../shared';

export interface UserModule {
  app: string | string[];
  error: string | string[];
  server: string | string[];
}

export interface ProjectContext {
  entryCodes: string[];
  runtimeConfig: IRuntimeConfig;
  platformModule: string;
  userModule: UserModule;
}

export const createProjectContext = (): ProjectContext => {
  return {
    entryCodes: [],
    runtimeConfig: {},
    platformModule: '',
    userModule: {
      app: '',
      error: '',
      server: ''
    }
  };
};
