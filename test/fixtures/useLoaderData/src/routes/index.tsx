import React from 'react';
import { useLoaderData, Loader, Link } from '@shuvi/runtime';
import { sleep } from '../utils';

const Index = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>{data?.hello}</p>
      <div>
        <Link to={`/parent/foo/a`}>Go /foo/a</Link>
      </div>
    </div>
  );
};

type LoaderData = {
  hello: string;
};

export const loader: Loader<LoaderData> = async ctx => {
  await sleep(100);
  return {
    hello: 'world'
  };
};

export default Index;
