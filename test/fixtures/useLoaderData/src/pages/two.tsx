import React from 'react';
import { useLoaderData, Loader, Link } from '@shuvi/runtime';
import { sleep } from '../utils';

const Two = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div data-test-id="two">
      <div data-test-id="name">Page Two</div>
      <div data-test-id="time">{data?.time}</div>
      <Link to="/one?test=555">Goto Page One</Link>
    </div>
  );
};

type LoaderData = {
  time: number;
};

export const loader: Loader<LoaderData> = async ({ query }) => {
  await sleep(300);
  console.log('loader two done');
  return {
    time: 2,
    query
  };
};

export default Two;
