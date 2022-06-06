import React from 'react';
import { useLoaderData, Loader, Link } from '@shuvi/runtime';
import { sleep } from '../utils';

const Index = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>{data?.hello}</p>
      <div>
        <Link to={`/loader/child?sssss=111`}>Go /loader/child with query</Link>
      </div>
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
