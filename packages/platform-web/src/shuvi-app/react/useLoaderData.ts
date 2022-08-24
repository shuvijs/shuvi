import { useMatchedRoute } from '@shuvi/router-react';
import { IPageRouteRecord, loaderModel } from '@shuvi/platform-shared/shared';
import { useStaticModel } from './store';

export const noLoaderMessage =
  'Warning: no loader found. Please make sure the page component where `useLoaderData` is called has a `loader` export.';

const hasOwn = Object.prototype.hasOwnProperty;
export const useLoaderData = <T = any>(): T => {
  const currentMatch = useMatchedRoute<IPageRouteRecord>();
  const id = currentMatch.route!.id;

  // we don't need to watch the model change, cause it always change with
  // matched route
  const [state] = useStaticModel(loaderModel);

  if (!hasOwn.call(state.current.dataByRouteId, id)) {
    throw Error(noLoaderMessage);
  }

  return state.current.dataByRouteId[id];
};
