import { useMatchedRoute } from '@shuvi/router-react';
import {
  IPageRouteRecord,
  loaderModel,
  loaderModelName
} from '@shuvi/platform-shared/shared';
import { useStaticModel } from './store';

export const noLoaderMessage =
  'Loader data not found. Please make sure the page component where `useLoaderData` is called has a `loader` export.';

const hasOwn = Object.prototype.hasOwnProperty;
export const useLoaderData = <T = any>(): T => {
  const currentMatch = useMatchedRoute<IPageRouteRecord>();
  const id = currentMatch.route!.id;

  // we don't need to watch the model change, cause it always change with
  // matched route
  const loaderData = useStaticModel(loaderModelName, loaderModel);

  if (!hasOwn.call(loaderData.dataByRouteId, id)) {
    throw Error(noLoaderMessage);
  }

  return loaderData.dataByRouteId[id];
};
