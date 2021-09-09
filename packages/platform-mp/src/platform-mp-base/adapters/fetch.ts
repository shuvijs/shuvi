// import { getCookiesStr } from './cookieLib'

export interface IFetchOptions {
  body?: any;
  method?: 'OPTIONS' | 'GET' | 'POST' | 'DELETE' | 'PUT' | 'DELETE' | 'HEAD';
  headers?: { [key: string]: string };
}

declare var bn: any;
declare var __mp_private_api__: any;

export function fetch(url: string, options: IFetchOptions = {}) {
  const { headers, ...rest } = options;

  if (
    typeof __mp_private_api__ !== 'undefined' &&
    typeof __mp_private_api__.request === 'function'
  ) {
    return __mp_private_api__.request({
      url,
      headers: {
        'content-type': 'application/json',
        // Cookie: getCookiesStr(),
        ...headers
      },
      ...rest
    });
  } else {
    return bn.request({
      url,
      headers: {
        'content-type': 'application/json',
        // Cookie: getCookiesStr(),
        ...headers
      },
      ...rest
    });
  }
}
