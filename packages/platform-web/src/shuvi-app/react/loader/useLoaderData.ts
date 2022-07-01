import { useMatchedRoute } from '@shuvi/router-react';
import type { IPageRouteRecord } from '@shuvi/platform-shared/esm/runtime';
import { useState, useEffect } from 'react';
import { getLoaderManager, LoaderStatus } from './loaderManager';
import { noLoaderMessage } from '../utils/errorMessage';

export const useLoaderData = <T = any>(): T => {
  const currentMatch = useMatchedRoute<IPageRouteRecord>();
  const loaderManager = getLoaderManager();
  const id = currentMatch.route?.id as string;
  const loader = loaderManager.get(id);
  if (!loader) {
    throw Error(noLoaderMessage);
  }

  // error indicates loader running failed and it should be thrown to break off rendering
  if (loader.result.error) {
    throw Error('loader running failed');
  }

  const [result, setResult] = useState(loader.result.data);
  useEffect(() => {
    const cancel = loader?.onChange((status, loaderResult) => {
      if (status === LoaderStatus.fulfilled) {
        setResult(loaderResult.data);
      }
    });
    return () => {
      cancel?.();
    };
  }, []);
  return result;
};
