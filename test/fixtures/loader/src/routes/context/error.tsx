import React from 'react';
import { Loader } from '@shuvi/runtime';

export default () => {
  return <div>Error Page</div>;
};

export const loader: Loader = async ctx => {
  const { query, error } = ctx;
  if (query) {
    if (query.code) {
      return error(query.message as string, +query.code);
    } else {
      return error(query.message as string);
    }
  }
};
