import { join } from 'path';
import {
  exceptionGenerator,
  fileTypeChecker,
  getAllowFilesAndDirs,
  getDirs,
  hasAllowFiles,
  hasRouteChildren,
  isDirectory,
  normalize,
  readDir,
  routeTypeChecker,
  routeFilter,
  getRelativeAtRoot
} from './helpers';

import {
  ConventionRouteRecord,
  LayoutRouteRecord,
  MiddlewareRouteRecord,
  PageRouteRecord
} from './route-record';

interface TransformRouteResult {
  routes: ConventionRouteRecord[];
  warnings: string[];
  errors: string[];
}

interface TransformParams {
  parentPath: string;
  files: string[];
  routes: ConventionRouteRecord[];
  prefix: string;
  exceptionHandle: ExceptionHandle;
}

type ExceptionHandle = ReturnType<typeof exceptionGenerator>;

const transformFilesToRoutes = async (params: TransformParams) => {
  const {
    parentPath,
    routes = [],
    prefix = '',
    exceptionHandle,
    files
  } = params;
  let allowFilesAndDirs = await getAllowFilesAndDirs(files, parentPath);
  if (!allowFilesAndDirs.length) {
    const warningDirName = getRelativeAtRoot(parentPath);
    exceptionHandle.addWarning(`${warningDirName} is empty dir!`);
    return;
  }

  let dontNeedPushRoute = !hasAllowFiles(files);

  if (dontNeedPushRoute) {
    for (const file of allowFilesAndDirs) {
      const fullPath = join(parentPath, file);

      if (await isDirectory(fullPath)) {
        const files = await readDir(fullPath);
        await transformFilesToRoutes({
          parentPath: fullPath,
          files,
          routes,
          prefix: join(prefix, file),
          exceptionHandle
        });
      }
    }
    return;
  }

  const route: ConventionRouteRecord = {} as ConventionRouteRecord;

  const isLayoutRouteRecord = routeTypeChecker.hasLayout(allowFilesAndDirs);
  const isPageRouteRecord = routeTypeChecker.hasPage(allowFilesAndDirs);
  const pageLayoutConflicted = isPageRouteRecord && isLayoutRouteRecord;

  if (pageLayoutConflicted) {
    const pageFileFullName = allowFilesAndDirs.find(item =>
      item.startsWith('page.')
    );
    const layoutFileFullName = allowFilesAndDirs.find(item =>
      item.startsWith('layout.')
    );
    // layout and page conflicted
    const dirs = await getDirs(allowFilesAndDirs, parentPath);
    const ignorePage = await hasRouteChildren(dirs, parentPath);
    let validFilename = layoutFileFullName;
    if (ignorePage) {
      // ignore page
      allowFilesAndDirs = routeFilter.removePage(allowFilesAndDirs);
    } else {
      // ignore layout
      allowFilesAndDirs = routeFilter.removeLayout(allowFilesAndDirs);
      validFilename = pageFileFullName;
    }
    const dir = getRelativeAtRoot(parentPath);
    // a
    // tsx ts jsx js
    //  page.ts
    //  layout.js
    //  layout.js
    //  page.js
    exceptionHandle.addWarning(
      `Find both ${pageFileFullName} and ${layoutFileFullName} in "${dir}"!only "${validFilename}" is used.`
    );
  }

  for (const filename of allowFilesAndDirs) {
    const fullPath = join(parentPath, filename);
    const isPageFile = fileTypeChecker.isPage(filename);
    const isLayoutFile = fileTypeChecker.isLayout(filename);
    const isMiddlewareFile = fileTypeChecker.isMiddleware(filename);

    if (isMiddlewareFile) {
      route.path = normalize(prefix);
      (route as MiddlewareRouteRecord).middlewarePath = fullPath;
      routes.push(route);
      continue;
    }

    if (isPageFile || isLayoutFile) {
      route.path = normalize(prefix);
      (route as PageRouteRecord).pagePath = fullPath;
      routes.push(route);
      continue;
    }

    if (await isDirectory(fullPath)) {
      const files = await readDir(fullPath);
      if (isLayoutRouteRecord) {
        (route as LayoutRouteRecord).children =
          (route as LayoutRouteRecord).children || [];
        await transformFilesToRoutes({
          parentPath: fullPath,
          files,
          routes: (route as LayoutRouteRecord).children,
          prefix: filename,
          exceptionHandle
        });
        continue;
      }

      await transformFilesToRoutes({
        parentPath: fullPath,
        files,
        routes,
        prefix: join(prefix, filename),
        exceptionHandle
      });
    }
  }
};

const addSalah = (routes: ConventionRouteRecord[]) => {
  return routes.map(route => {
    if (route.path === '/') {
      return { ...route };
    }
    return {
      ...route,
      path: `/${route.path}`
    };
  });
};

export const getRoutesWithLayoutFromDir = async (
  dirname: string
): Promise<TransformRouteResult> => {
  let routes: ConventionRouteRecord[] = [];
  let files = await readDir(dirname);
  const exceptionHandle = exceptionGenerator();
  const { getWarnings, getErrors } = exceptionHandle;

  const hasFirstLevelPage = routeTypeChecker.hasPage(files);

  if (hasFirstLevelPage) {
    files = routeFilter.removePage(files);
    exceptionHandle.addWarning(
      `first level page file will be ignore,in ${getRelativeAtRoot(dirname)}!`
    );
  }

  await transformFilesToRoutes({
    parentPath: dirname,
    files,
    routes,
    prefix: '/',
    exceptionHandle
  });

  // first level route add /
  routes = addSalah(routes);

  return {
    routes,
    errors: getErrors(),
    warnings: getWarnings()
  };
};
