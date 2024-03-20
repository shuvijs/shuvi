import React from 'react';
import { Loader } from '@shuvi/runtime';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const loader: Loader<any> = async ctx => {
  /**
   * Add a delay to verify the fatal error handling should work as
   * expected.
   */
  await sleep(100);
  ctx.error('Not Found', 404, { fatal: true });
  return null;
};

export default () => {
  return null;
};
