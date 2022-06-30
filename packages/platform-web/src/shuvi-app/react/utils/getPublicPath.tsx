import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';

declare global {
  interface Window {
    [key: string]: any;
  }
}

export function getPublicPath(path: string, publicPath: string) {
  if (
    window[IDENTITY_RUNTIME_PUBLICPATH] &&
    window[IDENTITY_RUNTIME_PUBLICPATH] !== publicPath
  ) {
    return window[IDENTITY_RUNTIME_PUBLICPATH] + path;
  }

  return publicPath + path;
}
