import { useMatchedRoute } from '@shuvi/router-react';
import {
  IPageRouteRecord,
  getLoaderManager
} from '@shuvi/platform-shared/shared';
import { useRef, useEffect, useReducer } from 'react';

export const noLoaderMessage =
  'Warning: no loader found. Please make sure the page component where `useLoaderData` is called has a `loader` export.';

export const useLoaderData = <T = any>(): T => {
  const currentMatch = useMatchedRoute<IPageRouteRecord>();
  const loaderManager = getLoaderManager();
  const id = currentMatch.route?.id as string;
  const data = loaderManager.getData(id);
  if (data === null) {
    throw Error(noLoaderMessage);
  }

  const dataRef = useRef(data);
  const [_, forceUpdate] = useReducer(state => state * -1, 1);
  useEffect(() => {
    const cancel = loaderManager.subscribe(() => {
      const newData = loaderManager.getData(id);
      if (newData !== data) {
        dataRef.current = newData;
        forceUpdate();
      }
    });

    return cancel;
  }, []);

  return dataRef.current;
};
