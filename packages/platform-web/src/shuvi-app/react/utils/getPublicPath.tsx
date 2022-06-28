import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';

declare global {
  interface Window {
    [key: string]: any;
  }
}

export function getPublicPath(path: string, publicPathFromAppData: string) {
  if (window[IDENTITY_RUNTIME_PUBLICPATH] !== publicPathFromAppData) {
    return window[IDENTITY_RUNTIME_PUBLICPATH] + path;
  }

  return publicPathFromAppData + path;
}
