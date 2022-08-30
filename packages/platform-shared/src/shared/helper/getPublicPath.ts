import { getAppData } from './getAppData';

export function getPublicPath(): string {
  const { publicPath } = getAppData();

  return publicPath;
}
