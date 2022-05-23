import React from 'react';
import { useLoaderData, Loader } from '@shuvi/runtime';
import { sleep } from '../utils';

const Index = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>{data?.hello}</p>
    </div>
  );
};

type LoaderData = {
  hello: string;
};

export const loader: Loader<LoaderData> = async ctx => {
  await sleep(300);
  return {
    hello: 'world'
  };
};

export default Index;
