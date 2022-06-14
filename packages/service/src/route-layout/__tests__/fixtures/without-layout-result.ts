import { IRouteRecord } from '@shuvi/router';
import { getFixturePath } from '../utils';

const getPath = (filename: string) => {
  return getFixturePath(`without-layout/${filename}/page.js`);
};

export const withoutLayoutResult: IRouteRecord[] = [
  {
    path: 'a',
    filepath: getPath('a')
  },
  {
    path: 'b',
    filepath: getPath('b')
  },
  {
    path: '/',
    filepath: getPath('')
  }
];
