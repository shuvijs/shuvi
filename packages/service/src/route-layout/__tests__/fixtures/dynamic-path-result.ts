import { ConventionRouteRecord } from '../../../../src/route-layout/route-record';

export const dynamicPathResult: ConventionRouteRecord[] = [
  {
    path: '/',
    pagePath: 'layout.js',
    children: [
      {
        path: 'a/:id',
        pagePath: 'a/[id]/page.js'
      },
      {
        path: 'b/:id?',
        pagePath: 'b/[[id]]/page.js'
      },
      {
        path: 'c/:id+',
        pagePath: 'c/[...id]/page.js'
      },
      {
        path: 'd/:id*',
        pagePath: 'd/[[...id]]/page.js'
      },
      { path: 'd', pagePath: 'd/page.js' },
      {
        path: 'e',
        pagePath: 'e/layout.js',
        children: [
          {
            path: ':id',
            pagePath: 'e/[id]/page.js'
          }
        ]
      },
      {
        path: 'f/:pid/:id',
        pagePath: 'f/[pid]/[id]/page.js'
      },
      {
        path: 'g/:pid/:id',
        pagePath: 'g/[pid]/[id]/page.js'
      },
      {
        path: 'g/:pid',
        pagePath: 'g/[pid]/page.js'
      }
    ]
  }
];
