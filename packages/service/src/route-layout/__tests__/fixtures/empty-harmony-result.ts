import { IRouteRecord } from '@shuvi/router';
import { getFixturePath } from '../utils';

export const emptyHarmonyResult: IRouteRecord[] = [
  {
    path: '/',
    filepath: getFixturePath('has-not-file-harmony/page.js')
  }
];
