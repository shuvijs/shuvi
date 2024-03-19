import React from 'react';
import { Loader } from '@shuvi/runtime';

export const loader: Loader<any> = async ctx => {
  ctx.error('Not Found', 404, { fatal: true });
  return null;
};

export default () => {
  return null;
};
