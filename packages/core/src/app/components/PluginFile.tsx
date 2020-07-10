import React from 'react';
import { observer } from 'mobx-react';
import ModuleProxy from './files/ModuleProxy';
import { useSelector } from '../models/store';

function Plugin() {
  const source = useSelector(state => state.pluginModule);

  return <ModuleProxy name="plugin.js" source={source} defaultExport />;
}

export default observer(Plugin);
