import { ConventionRouteRecord } from '../../../../src/route-layout/route-record';

export const layoutResult: ConventionRouteRecord[] = [
  {
    path: '/',
    pagePath: 'layout.js',
    children: [
      {
        path: 'a',
        pagePath: 'a/layout.js',
        children: [
          {
            path: 'b',
            pagePath: 'a/b/page.js'
          },
          {
            path: 'c',
            pagePath: 'a/c/page.js'
          },
          {
            path: 'd',
            pagePath: 'a/d/layout.js',
            children: [
              {
                path: 'e',
                pagePath: 'a/d/e/page.js'
              }
            ]
          }
        ]
      }
    ]
  }
];
