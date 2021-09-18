import { matchPathname, pathToString, resolvePath } from '@shuvi/router';
import {
  navigateTo as nativeNavigateTo,
  redirectTo as nativeRedirectTo,
  navigateBack
} from '@tarojs/taro';
import invariant from '@shuvi/utils/lib/invariant';
// @ts-ignore
import routesMap from '@shuvi/app/files/routesMap';

type IOptions = {
  url: string;
  delta?: number;
  [any: string]: any;
};

function mapUrlToMpPath(options: IOptions) {
  if (typeof options === 'object') {
    invariant(!options.hash, 'not supported url hash');
    options.hash = '';
  }
  if (typeof options.url === 'string') {
    const { pathname, query, hash } = resolvePath(options.url);
    invariant(!hash, 'not supported url hash');
    if (hash) {
      options.url = pathToString({ pathname, query });
    }
    for (let i = 0; i < routesMap.length; i++) {
      const routeMap = routesMap[i];
      const match = matchPathname(routeMap[0], pathname);
      if (match) {
        const { params } = match;
        options.url = pathToString({
          pathname: routeMap[1],
          query: {
            ...query,
            ...(Object.keys(params).length
              ? {
                  __params: JSON.stringify(match.params),
                  __pathname: pathname
                }
              : {})
          }
        });
        return;
      }
    }
  }
}

interface INavigate {
  (options: IOptions): Promise<any> | void;
}

export const navigateTo: INavigate = function (options) {
  mapUrlToMpPath(options);
  return nativeNavigateTo(options);
};

export const redirectTo: INavigate = function (options) {
  mapUrlToMpPath(options);
  return nativeRedirectTo(options);
};

export { navigateBack };
