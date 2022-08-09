import { useMatchedRoute } from '@shuvi/router-react';
import { IPageRouteRecord, loaderModel } from '@shuvi/platform-shared/shared';
import { useSharedModel } from './store';

export const noLoaderMessage =
  'Warning: no loader found. Please make sure the page component where `useLoaderData` is called has a `loader` export.';

export const useLoaderData = <T = any>(): T => {
  const currentMatch = useMatchedRoute<IPageRouteRecord>();
  const id = currentMatch.route!.id;
  const [loader] = useSharedModel(
    loaderModel,
    s => {
      return {
        hasLoader: Object.prototype.hasOwnProperty.call(s.dataByRouteId, id),
        data: s.dataByRouteId[id]
      };
    },
    [id]
  );

  if (!loader.hasLoader) {
    throw Error(noLoaderMessage);
  }

  return loader.data;
};
