import React, { useContext } from 'react';

import MyContext from '../context/sharedContext';

if (typeof window !== 'undefined') {
  window.ReactFromRemote = React;
}
export default () => {
  const contextValue = useContext(MyContext);
  return (
    <div>
      <div>Remote component from A</div>
      <div>{contextValue}</div>
    </div>
  );
};
