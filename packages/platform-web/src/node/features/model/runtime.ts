import { IStoreManager, redox } from '@shuvi/redox';
import {
  createRuntimePlugin,
  getPageData,
  IAppContext
} from '@shuvi/platform-shared/shared';

export type InitRedox = (params: {
  initialState: any;
  ctx: IAppContext;
}) => IStoreManager;

let currentStore: IStoreManager;

const isServer = typeof window === 'undefined';

// for client, singleton mode
// for server, return new store
const initStore: InitRedox = ({ initialState, ctx }) => {
  const createStoreInstance = () => {
    // return createRedox(initialState, {
    //   ...ctx,
    //   isServer
    // });
    return redox({
      initialState
    });
  };
  // for server
  if (isServer) {
    return createStoreInstance();
  }

  // for client is singleton, just init once
  if (!currentStore) {
    currentStore = createStoreInstance();
  }

  return currentStore;
};

export default createRuntimePlugin(
  {
    appContext: ctx => {
      let initialState = {};
      if (!isServer) {
        initialState = getPageData('shuviInitialState', {});
      }
      ctx.store = initStore({
        ctx,
        initialState
      });
      return ctx;
    }
  },
  {
    name: 'model'
  }
);
