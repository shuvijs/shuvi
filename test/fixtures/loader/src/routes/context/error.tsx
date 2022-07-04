import React from 'react';
import { Loader } from '@shuvi/runtime';

export default () => {
  return <div>Error Page</div>;
};

export const loader: Loader = async ctx => {
  const { query, error } = ctx;
  if (query) {
    if (query.code) {
      error(+query.code, query.message as string);
    } else {
      error(query.message as string);
    }
  }
};
