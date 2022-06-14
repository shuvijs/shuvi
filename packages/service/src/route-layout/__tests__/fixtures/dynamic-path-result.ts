import { IRouteRecord } from '@shuvi/router';

export const dynamicPathResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: 'layout.js',
    children: [
      {
        path: 'a/:id',
        filepath: 'a/[id]/page.js'
      },
      {
        path: 'b/:id?',
        filepath: 'b/[[id]]/page.js'
      },
      {
        path: 'c/:id+',
        filepath: 'c/[...id]/page.js'
      },
      {
        path: 'd/:id*',
        filepath: 'd/[[...id]]/page.js'
      },
      { path: 'd', filepath: 'd/page.js' },
      {
        path: 'e',
        filepath: 'e/layout.js',
        children: [
          {
            path: ':id',
            filepath: 'e/[id]/page.js'
          }
        ]
      },
      {
        path: 'f/:pid/:id',
        filepath: 'f/[pid]/[id]/page.js'
      },
      {
        path: 'g/:pid/:id',
        filepath: 'g/[pid]/[id]/page.js'
      },
      {
        path: 'g/:pid',
        filepath: 'g/[pid]/page.js'
      }
    ]
  }
];
