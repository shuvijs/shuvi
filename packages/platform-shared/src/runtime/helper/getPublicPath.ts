import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';
import { getAppData } from './getAppData';

export function getPublicPath(): string {
  const { publicPath } = getAppData();

  return (window as any)[IDENTITY_RUNTIME_PUBLICPATH] || publicPath;
}
