import { getCookiesStr } from './cookieLib';

export interface IFetchOptions {
  body?: any;
  method?: 'OPTIONS' | 'GET' | 'POST' | 'DELETE' | 'PUT' | 'DELETE' | 'HEAD';
  headers?: { [key: string]: string };
}

declare var bn: any;

export function fetch(url: string, options: IFetchOptions = {}) {
  const { headers, ...rest } = options;

  return bn.request({
    url,
    headers: {
      'content-type': 'application/json',
      Cookie: getCookiesStr(),
      ...headers
    },
    ...rest
  });
}
