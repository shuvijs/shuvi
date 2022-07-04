import { useMatchedRoute } from '@shuvi/router-react';
import { IPageRouteRecord } from '@shuvi/platform-shared/esm/runtime';
import { getLoaderManager, LoaderStatus } from '../loader';
import { useState, useEffect } from 'react';

export const noLoaderMessage =
  'Warning: no loader found. Please make sure the page component where `useLoaderData` is called has a `loader` export.';

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
