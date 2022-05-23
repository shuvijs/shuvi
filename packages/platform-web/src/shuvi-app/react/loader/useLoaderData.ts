import { useMatchedRoute, useCurrentRoute } from '@shuvi/router-react';
import { createRedirector } from '@shuvi/router';
import {
  getErrorHandler,
  IModelManager
} from '@shuvi/platform-shared/esm/runtime';
import loaders from '@shuvi/app/files/loaders-build';
import { useState, useContext, useEffect } from 'react';
import { LoaderContext } from './context';
import { AppContext } from '../AppContainer';

export const useLoaderData = <T>(): T | null => {
  const currentMatch = useMatchedRoute();
  const currentRoute = useCurrentRoute();
  const { loadersData, willHydrate } = useContext(LoaderContext);
  const { appContext } = useContext(AppContext);
  const modelManager: IModelManager = appContext.modelManager;
  const error = getErrorHandler(modelManager);
  const redirector = createRedirector();
  const fullPath = (currentMatch?.route as any)?.fullPath as string;
  // use server loader data only when hydrating
  const loaderItem = willHydrate ? loadersData[fullPath] : null;
  const [item, setItem] = useState(loaderItem);
  useEffect(() => {
    let mounted = true;
    const loader = loaders[fullPath] as any;
    // must has loader and with the following conditions
    // ----------------
    // no loaderItem or
    // loaderItem got error
    if (loader && (!loaderItem || loaderItem?.error)) {
      const { query, pathname } = currentRoute;
      const { params } = currentMatch;
      Promise.resolve(
        loader({
          isServer: false,
          query,
          pathname,
          params,
          appContext,
          error: error.errorHandler,
          redirect: redirector.handler
        })
      )
        .then(res => {
          if (mounted) {
            setItem({
              data: res,
              loading: false
            });
          }
        })
        .catch(e => {
          if (mounted) {
            setItem({
              data: null,
              error: e.message,
              loading: false
            });
          }
        });
    }
    return () => {
      mounted = false;
    };
  }, [currentRoute]);
  return item?.data;
};
