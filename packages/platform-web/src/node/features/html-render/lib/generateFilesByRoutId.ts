import { IPageRouteRecord } from '@shuvi/platform-shared/shared';
import { IManifest } from '../../../../shared';

export default function generateFilesByRoutId(
  assetMap: IManifest,
  routes: IPageRouteRecord[]
): Record<string, string[]> {
  let filesByRoutId: Record<string, string[]> = {};
  const loadable = assetMap.loadble;
  routes.forEach(({ id, __componentRawRequest__ }) => {
    if (__componentRawRequest__ && loadable[__componentRawRequest__]) {
      filesByRoutId[id] = loadable[__componentRawRequest__]!.files;
    }
  });

  return filesByRoutId;
}
