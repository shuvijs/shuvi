import { Telestore } from '@shuvi/shared/lib/telestore';
// import { getAppData } from './getAppData';

export const telestore = new Telestore(
  typeof window === 'undefined' ? {} : {}
);
