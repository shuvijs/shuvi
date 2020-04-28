import React from 'react';
import { observer } from 'mobx-react';
import Module from '../components/files/Module';
import { useSelector } from '../models/store';

function Index() {
  const exports = useSelector(state => state.exports);
  return (
    <Module name="index.js" exports={Object.fromEntries(exports.entries())} />
  );
}

export default observer(Index);
