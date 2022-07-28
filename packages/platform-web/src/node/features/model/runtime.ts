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

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    storeManager?: IStoreManager;
  }
}

let currentStoreManager: IStoreManager;

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
  if (currentStoreManager) {
    return currentStoreManager;
  }

  currentStoreManager = createStoreInstance();

  return currentStoreManager;
};

export default createRuntimePlugin({
  appContext: ctx => {
    if (!ctx.storeManager) {
      let initialState = {};
      if (!isServer) {
        initialState = getPageData('redox');
      }
      if (ctx.pageData && ctx.pageData.redox) {
        initialState = ctx.pageData.redox;
      }
      ctx.storeManager = initStore({
        ctx,
        initialState
      });
    }
    return ctx;
  }
});
