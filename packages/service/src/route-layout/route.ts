import { IRouteRecord } from '@shuvi/router';
import invariant from '@shuvi/utils/lib/invariant';
import { join } from 'path';
import {
  fileTypeChecker,
  getAllowFilesAndDirs,
  hasAllowFiles,
  hasLayout,
  isDirectory,
  normalize,
  readDir
} from './helpers';

const transformFilesToRoutes = async (
  parentPath: string,
  files: string[],
  routes: IRouteRecord[] = [],
  prefix: string = ''
) => {
  const allowFilesAndDirs = getAllowFilesAndDirs(files, parentPath);

  if (!allowFilesAndDirs.length) {
    return;
  }

  let dontNeedPushRoute = !hasAllowFiles(files);

  if (dontNeedPushRoute) {
    for (const file of allowFilesAndDirs) {
      const fullPath = join(parentPath, file);

      if (await isDirectory(fullPath)) {
        const files = await readDir(fullPath);
        await transformFilesToRoutes(
          fullPath,
          files,
          routes,
          join(prefix, file)
        );
      }
    }
    return;
  }

  const route: IRouteRecord = {} as IRouteRecord;

  const isLayoutRouteRecord = hasLayout(files);

  if (isLayoutRouteRecord) {
    route.children = [];
  }

  for (const filename of allowFilesAndDirs) {
    const fullPath = join(parentPath, filename);
    const isPageFile = fileTypeChecker.isPage(filename);
    const isLayoutFile = fileTypeChecker.isLayout(filename);

    if (isPageFile && isLayoutRouteRecord) {
      console.warn('only one of page file and layout file can exist!');
      continue;
    }

    if (isPageFile || isLayoutFile) {
      route.path = normalize(prefix);
      route.filepath = fullPath;
      routes.push(route);
      continue;
    }

    if (await isDirectory(fullPath)) {
      const files = await readDir(fullPath);
      if (isLayoutRouteRecord) {
        await transformFilesToRoutes(fullPath, files, route.children, filename);
        continue;
      }

      await transformFilesToRoutes(
        fullPath,
        files,
        routes,
        join(prefix, filename)
      );
    }
  }
};

export const getRoutesWithLayoutFromDir = async (
  dirname: string
): Promise<IRouteRecord[]> => {
  const files = await readDir(dirname);
  const routes: IRouteRecord[] = [];

  invariant(files.length, 'should not input a empty dir!');
  await transformFilesToRoutes(dirname, files, routes, '/');
  invariant(routes.length, ' has not page file or layout file!');
  return routes;
};
