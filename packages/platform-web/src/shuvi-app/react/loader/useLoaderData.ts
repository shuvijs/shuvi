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
  const loaderItem = loadersData[fullPath];
  const [item, setItem] = useState(loaderItem);
  useEffect(() => {
    const loader = loaders[fullPath] as any;
    if (loader && (!loaderItem || !willHydrate || loaderItem?.error)) {
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
          setItem({
            data: res,
            loading: false
          });
        })
        .catch(e => {
          setItem({
            data: null,
            error: e.message,
            loading: false
          });
        });
    }
  }, [currentRoute]);
  return item?.data;
};
