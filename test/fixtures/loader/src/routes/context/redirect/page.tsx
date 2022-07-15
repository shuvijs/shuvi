import React from 'react';
import { Loader } from '@shuvi/runtime';

export default () => {
  return <div>Redirect Page</div>;
};

export const loader: Loader = async ctx => {
  const { query, redirect } = ctx;
  if (query) {
    if (query.code) {
      return redirect(query.target as string, +query.code);
    } else {
      return redirect(query.target as string);
    }
  }
};
