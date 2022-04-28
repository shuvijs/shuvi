import { redox, IModelManager } from '@shuvi/redox';
import { IPageError } from './models';

export type IAppState = {
  error?: IPageError;
};

let modelManager: IModelManager;

// for client, singleton mode
// for server, return new store
const getModelManager = (initialState: IAppState = {}): IModelManager => {
  // for server
  if (typeof window === 'undefined') {
    return redox(initialState);
  }
  // for client is singleton, just init once
  if (modelManager) {
    return modelManager;
  }

  modelManager = redox(initialState);

  return modelManager;
};

export { getModelManager, IModelManager };
