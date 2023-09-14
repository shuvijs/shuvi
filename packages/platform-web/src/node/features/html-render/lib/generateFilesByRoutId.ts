import { IPageRouteRecord } from '@shuvi/platform-shared/shared';
import { IManifest } from '../../../../shared';

export default function generateFilesByRoutId(
  assetMap: IManifest,
  routes: IPageRouteRecord[]
): Record<string, string[]> {
  let filesByRoutId: Record<string, string[]> = {};

  const processRoute = (route: IPageRouteRecord) => {
    const { id, __componentRawRequest__, children } = route;

    // Process the current route
    if (__componentRawRequest__ && assetMap.loadble[__componentRawRequest__]) {
      filesByRoutId[id] = assetMap.loadble[__componentRawRequest__]!.files;
    }

    // Recursively process children
    if (children) {
      children.forEach(processRoute);
    }
  };

  routes.forEach(processRoute);

  return filesByRoutId;
}
