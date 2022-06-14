import { IRouteRecord } from '@shuvi/router';
import { getFixturePath } from '../utils';

const getPath = (filename: string) => getFixturePath(`layout/${filename}`);

export const layoutResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: getPath('layout.js'),
    children: [
      {
        path: 'a',
        filepath: getPath('a/layout.js'),
        children: [
          {
            path: 'b',
            filepath: getPath('a/b/page.js')
          },
          {
            path: 'c',
            filepath: getPath('a/c/page.js')
          },
          {
            path: 'd',
            filepath: getPath('a/d/layout.js'),
            children: [
              {
                path: 'e',
                filepath: getPath('a/d/e/page.js')
              }
            ]
          }
        ]
      }
    ]
  }
];
