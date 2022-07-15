import React from 'react';
import { useLoaderData, Loader, Link } from '@shuvi/runtime';
import { sleep } from '../../utils';

const Two = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div data-test-id="two">
      <div data-test-id="name">Page Two</div>
      <div data-test-id="time">{data?.time}</div>
      <Link to="/one?test=123">Go to Page One</Link>
    </div>
  );
};

type LoaderData = {
  time: number;
};

export const loader: Loader<LoaderData> = async () => {
  await sleep(300);
  return {
    time: 2
  };
};

export default Two;
