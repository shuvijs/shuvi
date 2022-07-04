// FIXME: `IRuntimeModule` export
/* import { IRuntimeModule } from '@shuvi/runtime'; */

export const getAppComponent /* : IRuntimeModule['getAppComponent'] */ =
  async UserApp => {
    return UserApp;
  };

export const getAppContext /* : IRuntimeModule['getAppContext'] */ =
  context => {
    return context;
  };
