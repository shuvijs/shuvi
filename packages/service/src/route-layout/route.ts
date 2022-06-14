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

// 完整思路：
// 1、如果目录中存在page file，创建一个RouteRecord,不存在children
//  1.1 不创建children，即使目录有嵌套，在renderRouteTree中，也该是平级的，但path上有区分。
// 2、如果目录中存在layout file，
//  2.1、创建children
// 3、如果是目录，扫描子文件/子目录
//  3.1、 如果还有目录就递归。
//  3.2、 如果是page file或者layout file,按照1和2执行，其中只有page.js是叶节点。

const transformFilesToRoutes = async (
  parentPath: string,
  files: string[],
  routes: IRouteRecord[] = [],
  prefix: string = ''
) => {
  //
  // 只获取需要处理和关心的目录和文件，如果目录下都是文件夹，只是扩展下prefix。
  const allowFilesAndDirs = getAllowFilesAndDirs(files, parentPath);
  // 什么都没有，不执行
  if (!allowFilesAndDirs.length) {
    return;
  }
  // 只有有page或者layout的情况下去push route
  let dontNeedPushRoute = !hasAllowFiles(files);
  // 说明目录下面都是文件夹，只是作为path的一个片段,同层处理，prefix增加下路径即可
  if (dontNeedPushRoute) {
    for (const file of allowFilesAndDirs) {
      // 获取完整路径
      const fullPath = join(parentPath, file);
      // 不是目录的，直接ignore掉
      if (await isDirectory(fullPath)) {
        const files = await readDir(fullPath);
        // 在同层去生成route,所以不需要创建children,path的prefix加上了目录名即可。
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

    // 如果发现page.js，但是又已经有了layout.js,应该给警告，不处理page.js
    if (isPageFile && isLayoutRouteRecord) {
      console.warn('only one of page file and layout file can exist!');
      continue;
    }
    // 是 page 或者 layout
    if (isPageFile || isLayoutFile) {
      route.path = normalize(prefix);
      route.filepath = fullPath;
      routes.push(route);
      continue;
    }

    // 是路径
    if (await isDirectory(fullPath)) {
      const files = await readDir(fullPath);
      // 如果是layout 就往下塞children
      if (isLayoutRouteRecord) {
        await transformFilesToRoutes(fullPath, files, route.children, filename);
        continue;
      }

      // 如果是page 就同级塞route

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
