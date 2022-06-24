import React from 'react';
import { Loader } from '@shuvi/runtime';

export default () => {
  return <div>Redirect Page</div>;
};

export const loader: Loader = async ctx => {
  const { query, redirect } = ctx;
  if (query) {
    if (query.code) {
      redirect(+query.code, query.target as string);
    } else {
      redirect(query.target as string);
    }
  }
};
