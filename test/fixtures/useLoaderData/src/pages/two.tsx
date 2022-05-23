import React from 'react';
import { useLoaderData, Loader, Link } from '@shuvi/runtime';

let globalTime = 0;

const Two = () => {
  const data = useLoaderData<LoaderData>();
  console.log('render two');
  return (
    <div data-test-id="two">
      <div data-test-id="name">Page Two</div>
      <div data-test-id="time">{data?.time}</div>
      <Link to="/one">Goto Page One</Link>
    </div>
  );
};

type LoaderData = {
  time: number;
};

export const loader: Loader<LoaderData> = async ({ isServer }) => {
  await new Promise(resolve => setTimeout(() => resolve(null), 300));
  console.log('exsdsdsdsds', globalTime);
  if (!isServer) {
    globalTime++;
  }

  return {
    time: globalTime
  };
};

export default Two;
