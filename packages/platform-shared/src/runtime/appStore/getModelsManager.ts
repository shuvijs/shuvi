import { redox, IModelManager } from '@shuvi/redox';
import { IPageError } from './models';

export type IAppState = {
  error?: IPageError;
};

let modelsManager: IModelManager;

// for client, singleton mode
// for server, return new store
const getStoreManager = (initialState: IAppState = {}): IModelManager => {
  // for server
  if (typeof window === 'undefined') {
    return redox(initialState);
  }
  // for client is singleton, just init once
  if (modelsManager) {
    return modelsManager;
  }

  modelsManager = redox(initialState);

  return modelsManager;
};

export { getStoreManager, IModelManager };
