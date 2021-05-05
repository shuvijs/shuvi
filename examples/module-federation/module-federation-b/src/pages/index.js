import React from 'react';
import Component from 'mfeAAA/Component';
import RemoteContext from 'mfeAAA/Context';

export default () => {
  return (
    <RemoteContext.Provider value={'ModuleB'}>
      <div id="index">
        <Component />
      </div>
    </RemoteContext.Provider>
  );
};

if (__BROWSER__) {
  window.React = React;
  // should be true if module federation are sharing modules?
  console.log({ check: window.ReactFromRemote === React });
}
