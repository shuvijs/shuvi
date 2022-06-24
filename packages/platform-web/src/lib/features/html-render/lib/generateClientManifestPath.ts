import { IManifest } from '@shuvi/toolpack/lib/webpack/types';

export default function generateClientManifestPath(
  assetMap: IManifest,
  getAssetPublicUrl: Function
): Record<string, string[]> {
  let clientManifestPath: Record<string, string[]> = {};
  const loadable = assetMap.loadble;

  for (const path_full in loadable) {
    let path_short: string = path_full
      .replace(/^.*\/routes\//, '/')
      .replace(/\/page.js.*|\/page.ts.*|\?.*$/, '');
    if (path_short === '/index') path_short = '/';
    clientManifestPath[path_short] = assetMap.loadble[path_full].files.map(
      file => getAssetPublicUrl(file)
    );
  }
  return clientManifestPath;
}
