import { join } from 'path';
import {
  exceptionGenerator,
  fileTypeChecker,
  getAllowFilesAndDirs,
  hasAllowFiles,
  normalize,
  readDir,
  routeTypeChecker,
  getRelativeAtRoot
} from './helpers';

import {
  ConventionRouteRecord,
  LayoutRouteRecord,
  MiddlewareRouteRecord,
  PageRouteRecord
} from './route-record';
import type { IRouteRecord } from '@shuvi/router';
import { isDirectory } from '@shuvi/utils/lib/file';
import { renameFilepathToComponent } from '../route/route';

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

  if (isLayoutRouteRecord) {
    (route as LayoutRouteRecord).children = [];
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

    if (isPageFile && isLayoutRouteRecord) {
      (route as LayoutRouteRecord).children.push({
        path: '',
        pagePath: fullPath
      });
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
      let workRoutes = routes;
      let workPrefix = join(prefix, filename);
      if (isLayoutRouteRecord) {
        workRoutes = (route as LayoutRouteRecord).children;
        workPrefix = filename;
      }
      await transformFilesToRoutes({
        parentPath: fullPath,
        files,
        routes: workRoutes,
        prefix: workPrefix,
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

  await transformFilesToRoutes({
    parentPath: dirname,
    files,
    routes,
    prefix: '/',
    exceptionHandle
  });

  routes = addSalah(routes);

  return {
    routes,
    errors: getErrors(),
    warnings: getWarnings()
  };
};

type AllowKeys = keyof ConventionRouteRecord;

const transformConventionRouteRecordToIRouteRecord = (
  routeRecords: Array<ConventionRouteRecord>,
  key: string
): IRouteRecord[] => {
  const pageRoutes = routeRecords.filter(
    record => typeof record[key as AllowKeys] === 'string'
  );
  return pageRoutes.map(record => {
    const iRouteRecord: IRouteRecord = {
      path: record.path,
      filepath: record[key as AllowKeys] as string
    };

    if (Array.isArray((record as LayoutRouteRecord).children)) {
      iRouteRecord.children = transformConventionRouteRecordToIRouteRecord(
        (record as LayoutRouteRecord).children,
        key
      );
    }

    return iRouteRecord;
  });
};

const getRoutes = async (
  routesDir: string,
  key: string
): Promise<IRouteRecord[]> => {
  const { routes, warnings } = await getRoutesWithLayoutFromDir(routesDir);
  warnings.forEach(warning => {
    console.warn(warning);
  });
  return transformConventionRouteRecordToIRouteRecord(routes, key);
};

export const getLayoutPageRoutes = async (routesDir: string) => {
  const routes = await getRoutes(routesDir, 'pagePath');
  return renameFilepathToComponent(routes);
};

export const getMiddlewareRoutes = (routesDir: string) =>
  getRoutes(routesDir, 'middlewarePath');

export const getApiRoutes = (routesDir: string) =>
  getRoutes(routesDir, 'apiPath');
