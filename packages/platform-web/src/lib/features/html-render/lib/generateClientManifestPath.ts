import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IRouteRecord } from '@shuvi/router';

export default function generateClientManifestPath(
  assetMap: IManifest,
  routes: IRouteRecord[]
): Record<string, string[]> {
  let clientManifestPath: Record<string, string[]> = {};
  const loadable = assetMap.loadble;
  routes.forEach(({ id, __componentSourceWithAffix__ }) => {
    clientManifestPath[id] = loadable[__componentSourceWithAffix__].files;
  });

  return clientManifestPath;
}
