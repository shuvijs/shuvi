import React from 'react';
import { useLoaderData, Link, Loader } from '@shuvi/runtime';
import { sleep } from '../utils';

let globalTime = 0;

const One = () => {
  console.log('render one');
  const data = useLoaderData<LoaderData>();
  return (
    <div data-test-id="one">
      <div data-test-id="name">Page One</div>
      <div data-test-id="time">{data?.time}</div>
      <Link to="/two">Goto Page Two</Link>
    </div>
  );
};

type LoaderData = {
  time: number;
};

export const loader: Loader<LoaderData> = async ({ isServer }) => {
  await sleep(300);

  if (!isServer) {
    globalTime++;
  }

  return {
    time: globalTime
  };
};

export default One;
