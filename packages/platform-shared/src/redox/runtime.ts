import { IStoreManager, redox } from '@shuvi/redox';
import { createPlugin, getPageData, IAppContext } from '../runtime';
// @ts-ignore
// import { createRedox } from '@shuvi/user/plugin';

export type InitRedox = (params: {
  initialState: any;
  ctx: IAppContext;
}) => IStoreManager;

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
    return createStoreInstance();
  }

  currentStoreManager = createStoreInstance();

  return currentStoreManager;
};

export default createPlugin({
  getAppContext: ctx => {
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
