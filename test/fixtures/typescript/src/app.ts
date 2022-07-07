// FIXME: `IAppModule` export

export const appComponent /* : IAppModule['appComponent'] */ =
  async UserApp => {
    return UserApp;
  };

export const appContent /* : IAppModule['appContext'] */ = context => {
  return context;
};
