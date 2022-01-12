import { createServerPlugin } from '@shuvi/service';
export default createServerPlugin({
  pageData: appContext => {
    const { store } = appContext;
    delete appContext.store
    return {
      redux: store.getState()
    };
  }
});
