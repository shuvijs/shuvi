import { IRouteRecord } from '@shuvi/router';

export const withoutLayoutResult: IRouteRecord[] = [
  {
    path: '/a',
    filepath: 'a/page.js'
  },
  {
    path: '/b',
    filepath: 'b/page.js'
  },
  {
    path: '/',
    filepath: 'page.js'
  }
];
