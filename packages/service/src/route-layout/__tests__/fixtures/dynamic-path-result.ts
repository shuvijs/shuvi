import { IRouteRecord } from '@shuvi/router';
import { getFixturePath } from '../utils';

const getPath = (filename: string) =>
  getFixturePath(`has-dynamic-path/${filename}`);

export const dynamicPathResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: getPath('layout.js')
  },
  {
    path: '/words',
    filepath: getPath('words/page.js')
  },
  {
    path: '/words/:id',
    filepath: getPath('words/[id]/page.js')
  }
];
