import React, { useEffect } from 'react';
import { useLoaderData, Loader, Link } from '@shuvi/runtime';
import { sleep } from '../utils';

const Index = () => {
  const data = useLoaderData<LoaderData>();

  useEffect(() => {
    if (!(window as any).__test_falg__) {
      (window as any).__client_test_flag__ = true;
    }
  }, []);

  return (
    <div id="loader-index">
      <p>{data.hello}</p>
      <div>
        <Link to={`/parent/foo/a`}>Go /foo/a</Link>
        <Link to={`/always-fail`}>Go /always-fail</Link>
      </div>
    </div>
  );
};

type LoaderData = {
  hello: string;
};

export const loader: Loader<LoaderData> = async ctx => {
  if (typeof window !== 'undefined') {
    (window as any).__test_falg__ = true;
  }

  await sleep(100);

  return {
    hello: 'world'
  };
};

export default Index;
