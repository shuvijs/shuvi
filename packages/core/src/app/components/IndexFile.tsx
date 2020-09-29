import React from 'react';
import { observer } from 'mobx-react';
import Module from '../components/files/Module';
import { useSelector } from '../models/store';
import DefinitionTSFile from './files/DefinitionTSFile';

function Index() {
  const exports = useSelector(state => state.exports);
  return (
    <>
      <Module name="index.js" exports={Object.fromEntries(exports.entries())} />
      <DefinitionTSFile
        name="index.d.ts"
        exports={Object.fromEntries(exports.entries())}
        typeName="@shuvi/app"
      />
    </>
  );
}

export default observer(Index);
