import { createServerPlugin } from '@shuvi/service';
export default createServerPlugin({
  pageData: (appContext) => {
    const { store } = appContext;
    console.warn('store', store)
    return {
      redux: store.getState()
    };
  }
})
