import React from 'react';
import { useLoaderData } from '@shuvi/runtime';

const Index = () => {
  const data = useLoaderData();
  return (
    <div>
      <p>{data}</p>
    </div>
  );
};

export default Index;
