import { IRouteRecord } from '@shuvi/router';

export const layoutResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: 'layout.js',
    children: [
      {
        path: 'a',
        filepath: 'a/layout.js',
        children: [
          {
            path: 'b',
            filepath: 'a/b/page.js'
          },
          {
            path: 'c',
            filepath: 'a/c/page.js'
          },
          {
            path: 'd',
            filepath: 'a/d/layout.js',
            children: [
              {
                path: 'e',
                filepath: 'a/d/e/page.js'
              }
            ]
          }
        ]
      }
    ]
  }
];
