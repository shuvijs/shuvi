import { init, RematchRootState } from '@shuvi/redox';
import { models, RootModel } from './models';

const initialStore = (preloadedState?: IAppState) => {
  const tempModels = models;
  if (preloadedState && preloadedState.error) {
    tempModels.error.state = {
      ...tempModels.error.state,
      ...preloadedState.error
    };
  }
  return init({
    models: tempModels
  });
};

export type IAppStore = ReturnType<typeof initialStore>;
export type IAppState = RematchRootState<RootModel>;

let appStore: IAppStore;

// for client, singleton mode
// for server, return new store
const getAppStore = (preloadedState?: IAppState) => {
  // for server
  if (typeof window === 'undefined') {
    return initialStore(preloadedState);
  }
  // for client is singleton, just init once
  if (appStore) {
    return appStore;
  }

  appStore = initialStore(preloadedState);

  return appStore;
};

export { getAppStore, initialStore };
