import React from 'react';
// @ts-ignore FIXME
import { useRouter } from '@shuvi/app';
import { hello } from '../components/hello';
import { World } from '../components/world';

export default function HelloPage(): JSX.Element {
  const { pathname } = useRouter();
  return (
    <div data-test-id="page">
      <div data-test-id="pathname">{pathname}</div>
      <p data-test-id="bigInt">One trillion dollars: {1_000_000_000_000}</p>
      {hello()} <World />
    </div>
  );
}
