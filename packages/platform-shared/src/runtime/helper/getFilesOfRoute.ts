import type { IRouter, PathRecord } from '../router';
import { getAppData } from './getAppData';
import { getPublicPath } from './getPublicPath';

export type RouteFile = {
  id: string;
  url: string;
};

export type RouteFiles = {
  js: RouteFile[];
  css: RouteFile[];
};

export function getFilesOfRoute(router: IRouter, to: PathRecord): RouteFiles {
  const { filesByRoutId } = getAppData();
  const { publicPath } = getPublicPath();

  const js: RouteFile[] = [];
  const css: RouteFile[] = [];
  const targetRoute = router.match(to);

  targetRoute.forEach(({ route: { id } }) => {
    filesByRoutId[id].map(path => {
      const file = {
        url: `${publicPath}/${path}`,
        id
      };
      if (path.endsWith('.js')) {
        js.push(file);
      } else if (path.endsWith('.css')) {
        css.push(file);
      }
    });
  });

  return {
    js,
    css
  };
}
