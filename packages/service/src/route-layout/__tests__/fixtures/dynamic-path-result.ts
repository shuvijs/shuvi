import { IRouteRecord } from '@shuvi/router';
import { getFixturePath } from '../utils';

const getPath = (filename: string) =>
  getFixturePath(`dynamic-path/${filename}`);

export const dynamicPathResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: getPath('layout.js'),
    children: [
      {
        path: 'a/:id',
        filepath: getPath('a/[id]/page.js')
      },
      {
        path: 'b/:id?',
        filepath: getPath('b/[[id]]/page.js')
      },
      {
        path: 'c/:id+',
        filepath: getPath('c/[...id]/page.js')
      },
      {
        path: 'd/:id*',
        filepath: getPath('d/[[...id]]/page.js')
      },
      { path: 'd', filepath: getPath('d/page.js') },
      {
        path: 'e',
        filepath: getPath('e/layout.js'),
        children: [
          {
            path: ':id',
            filepath: getPath('e/[id]/page.js')
          }
        ]
      },
      {
        path: 'f/:pid/:id',
        filepath: getPath('f/[pid]/[id]/page.js')
      },
      {
        path: 'g/:pid/:id',
        filepath: getPath('g/[pid]/[id]/page.js')
      },
      {
        path: 'g/:pid',
        filepath: getPath('g/[pid]/page.js')
      }
    ]
  }
];
