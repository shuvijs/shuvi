import { createStore, Store } from '@shuvi/shared/lib/miniRedux';
import rootReducer from './rootReducer';
import { IPageError, IPageErrorAction } from './pageError/actions';

export type IAppState = {
  error: IPageError;
};

export type IAppStore = Store<IAppState, IPageErrorAction>;

let appStore: IAppStore;

const initialStore = (preloadedState: IAppState) => {
  return createStore(rootReducer, preloadedState as any);
};

// for client, singleton mode
// for server, return new store
const getAppStore = (preloadedState?: IAppState) => {
  if (typeof window === 'undefined') {
    return initialStore(preloadedState as any);
  }
  if (appStore) {
    return appStore;
  }
  appStore = initialStore(preloadedState as any);

  return appStore;
};

export { getAppStore, initialStore };
