import { useMatchedRoute } from '@shuvi/router-react';
import { IPageRouteRecord } from '@shuvi/platform-shared/esm/runtime';
import { useState, useEffect } from 'react';
import { getLoaderManager, LoaderResult, LoaderStatus } from './loaderManager';
import { noLoaderMessage } from '../utils/errorMessage';

export const useLoaderData = <T>(): T | null => {
  const currentMatch = useMatchedRoute<IPageRouteRecord>();
  const loaderManager = getLoaderManager();
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
