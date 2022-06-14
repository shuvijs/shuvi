import { IRouteRecord } from '@shuvi/router';
import { getFixturePath } from '../utils';

export const emptyHarmonyResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: getFixturePath('empty-harmony/page.js')
  }
];
