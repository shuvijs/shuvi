import React from 'react';
if (typeof window !== 'undefined') {
  window.ReactFromRemote = React;
}
export default () => <div>Remote component from A</div>;
