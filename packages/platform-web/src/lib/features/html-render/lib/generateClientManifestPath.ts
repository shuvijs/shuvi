import { IManifest } from '@shuvi/toolpack/lib/webpack/types';

export default function generateClientManifestPath(
  assetMap: IManifest
): Record<string, string[]> {
  let clientManifestPath: Record<string, string[]> = {};
  const loadable = assetMap.loadble;

  for (const path in loadable) {
    clientManifestPath[path] = assetMap.loadble[path].files.map(file => file);
  }
  return clientManifestPath;
}
