import { Doura, doura } from 'doura';
import {
  getPageData,
  IAppContext,
  createRuntimePluginAfter
} from '@shuvi/platform-shared/shared';
import { DouraWrapper } from './Wrapper';

declare module '@shuvi/runtime' {
  interface CustomAppContext {
    store: Doura;
  }
}

type InitDoura = (params: { initialState: any; ctx: IAppContext }) => Doura;

let currentStore: Doura;

const isServer = typeof window === 'undefined';

// for client, singleton mode
// for server, return new store
const initStore: InitDoura = ({ initialState, ctx }) => {
  const createStoreInstance = () => {
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

// this needs to be run last
export default createRuntimePluginAfter(
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
    },
    appComponent: async (App, appContext) => {
      return DouraWrapper(App, {
        store: appContext.store
      });
    }
  },
  {
    name: 'model-react'
  }
);
