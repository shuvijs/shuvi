import { createStore, Store } from '@shuvi/shared/lib/miniRedux';
import rootReducer from './rootReducer';
import { IPageError, IPageErrorAction } from './pageError/actions';
import { getAppData } from '../helper';

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
  // for server
  if (typeof window === 'undefined') {
    return initialStore(preloadedState as any);
  }
  // for client is singleton, just init once
  if (appStore) {
    return appStore;
  }
  const appData = getAppData();
  const { appState } = appData;
  appStore = initialStore(appState as any);

  return appStore;
};

export { getAppStore, initialStore };
