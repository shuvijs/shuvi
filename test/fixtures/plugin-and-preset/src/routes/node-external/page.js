import React from 'react';
import lodash from 'lodash';

const arr = [];

const Page = () => {
  return (
    <div>
      <div>lodash.isArray: {lodash.isArray(arr).toString()}</div>
    </div>
  );
};

export default Page;
