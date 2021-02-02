import React from 'react';
import Component from 'mfeAAA/Component';
console.log({ Component });

export default () => {
  console.log({ Component });
  return (
    <div id="index">
      <Component />
    </div>
  );
};

if (__BROWSER__) {
  window.React = React;
  // should be true if module federation are sharing modules?
  console.log({ check: window.ReactFromRemote === React });
}
