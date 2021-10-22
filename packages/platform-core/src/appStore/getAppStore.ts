import { createStore, Store } from './miniRedux';
import rootReducer from './rootReducer';
import { IPageError, IPageErrorAction } from './pageError/actions';

export type IAppStore = Store<
  {
    error: IPageError;
  },
  IPageErrorAction
>;

let appStore: IAppStore;

// for server, only init once
const initialStore = (preloadedState: { error: IPageError }) => {
  return createStore(rootReducer, preloadedState as any);
};

// for client, Singleton mode
const getAppStore = (preloadedState?: { error: IPageError }) => {
  if (appStore) {
    return appStore;
  }
  appStore = initialStore(preloadedState!);

  return appStore;
};

export { getAppStore, initialStore };
