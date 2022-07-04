import React from 'react';
import { useLoaderData, Loader } from '@shuvi/runtime';

const Index = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>{data.hello}</p>
    </div>
  );
};

type LoaderData = {
  hello: string;
};

export const loader: Loader<LoaderData> = async () => {
  throw new Error('server failed');
};

export default Index;
