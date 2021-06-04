import React from 'react';
import { observer } from 'mobx-react';
import ModuleProxy from './files/ModuleProxy';
import { useSelector } from '../models/store';

function App() {
  const source = useSelector((state) => state.appModule);

  return <ModuleProxy name="app.js" source={source} defaultExport />;
}

export default observer(App);
