import { useMatchedRoute } from '@shuvi/router-react';
import { IAppRouteConfig } from '@shuvi/platform-shared/esm/runtime';
import { useState, useContext, useEffect } from 'react';
import { LoaderManager, LoaderResult, LoaderStatus } from './loaderManager';
import { AppContext } from '../AppContainer';
import { noLoaderMessage } from '../utils/errorMessage';

export const useLoaderData = <T>(): T | null => {
  const currentMatch = useMatchedRoute<IAppRouteConfig>();
  const { appContext } = useContext(AppContext);
  const loaderManager: LoaderManager = appContext.loaderManager;
  const id = currentMatch.route?.id as string;
  const loader = loaderManager.get(id);
  if (!loader) {
    console.error(noLoaderMessage);
  }
  // use server loader data only when hydrating
  const [result, setResult] = useState<LoaderResult>(
    loader?.result as LoaderResult
  );
  useEffect(() => {
    const cancel = loader?.onChange((status, loaderResult) => {
      if (status === LoaderStatus.fulfilled) {
        setResult(loaderResult);
      }
    });
    return () => {
      cancel?.();
    };
  }, []);
  return result?.data;
};
