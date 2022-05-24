import React from 'react';
import { useLoaderData, Link, Loader } from '@shuvi/runtime';
import { sleep } from '../utils';

const One = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div data-test-id="one">
      <div data-test-id="name">Page One</div>
      <div data-test-id="time">{data?.time}</div>
      <div data-test-id="test">{data?.query.test}</div>
      <Link to="/two">Goto Page Two</Link>
    </div>
  );
};

type LoaderData = {
  time: number;
  query: Record<string, any>;
};

export const loader: Loader<LoaderData> = async ({ query }) => {
  await sleep(300);
  return {
    query,
    time: 1
  };
};

export default One;
