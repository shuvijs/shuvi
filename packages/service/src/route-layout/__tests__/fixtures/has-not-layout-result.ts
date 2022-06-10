import { IRouteRecord } from '@shuvi/router';
import { getFixturePath } from '../utils';

const getPath = (filename: string) => {
  return getFixturePath(`has-not-layout/${filename}/page.js`);
};

export const hasNotLayoutResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: getPath('')
  },
  {
    path: '/a',
    filepath: getPath('a')
  },
  {
    path: '/b',
    filepath: getPath('b')
  }
];
