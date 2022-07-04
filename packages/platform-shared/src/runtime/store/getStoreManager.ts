import { redox, IStoreManager } from '@shuvi/redox';
import { IPageError } from './models';

export type IAppState = {
  error?: IPageError;
};

let storeManager: IStoreManager;
// for client, singleton mode
// for server, return new store
const getStoreManager = (initialState: IAppState = {}): IStoreManager => {
  // for server
  if (typeof window === 'undefined') {
    return redox({
      initialState
    });
  }

  // for client is singleton, just init once
  if (storeManager) {
    return storeManager;
  }

  storeManager = redox({
    initialState
  });

  return storeManager;
};

export { getStoreManager, IStoreManager };
