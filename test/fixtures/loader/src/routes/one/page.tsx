import React from 'react';
import { useLoaderData, Link } from '@shuvi/runtime';

const One = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div data-test-id="one">
      <div data-test-id="name">Page One</div>
      <div>{data.url}</div>
      <div data-test-id="time">{data.time}</div>
      <div data-test-id="test">{data.query.test}</div>
      <Link to="/two">Goto Page Two</Link>
      <br />
      <Link to="/one?test=456">Goto Page One With Query</Link>
    </div>
  );
};

type LoaderData = {
  time: number;
  query: Record<string, any>;
  url: string;
};

export default One;

export { loader } from './loader';
