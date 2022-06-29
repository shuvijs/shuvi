import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IRouteRecord } from '@shuvi/router';

export default function generateFilesByRoutId(
  assetMap: IManifest,
  routes: IRouteRecord[]
): Record<string, string[]> {
  let filesByRoutId: Record<string, string[]> = {};
  const loadable = assetMap.loadble;
  routes.forEach(({ id, __componentSourceWithAffix__ }) => {
    filesByRoutId[id!] = loadable[__componentSourceWithAffix__!].files;
  });

  return filesByRoutId;
}
