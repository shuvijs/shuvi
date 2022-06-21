import { useMatchedRoute } from '@shuvi/router-react';
import { useModel } from '@shuvi/redox-react';
import {
  IPageRouteRecord,
  loaderModel
} from '@shuvi/platform-shared/lib/runtime';

export const useLoaderData = <T>(): T | null => {
  const currentMatch = useMatchedRoute<IPageRouteRecord>();
  const id = currentMatch.route?.id as string;
  const [loader] = useModel(loaderModel, state => state.loadersById[id]);
  if (!loader) {
    console.error(
      'Warning: no loader found. Please make sure the page component where `useLoaderData` is called has a `loader` export.'
    );
  }

  return loader.data;
};
