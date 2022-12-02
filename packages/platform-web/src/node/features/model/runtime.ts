import { Doura, doura } from 'doura';
import {
  createRuntimePlugin,
  getPageData,
  IAppContext
} from '@shuvi/platform-shared/shared';

export type InitDoura = (params: {
  initialState: any;
  ctx: IAppContext;
}) => Doura;

let currentStore: Doura;

const isServer = typeof window === 'undefined';

// for client, singleton mode
// for server, return new store
const initStore: InitDoura = ({ initialState, ctx }) => {
  const createStoreInstance = () => {
    // return createDoura(initialState, {
    //   ...ctx,
    //   isServer
    // });
    return doura({
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
    }
  },
  {
    name: 'model'
  }
);
