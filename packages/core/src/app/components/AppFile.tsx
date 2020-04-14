import React from 'react';
import Module from './files/ModuleProxy';
import { useSelector } from '../models/store';

function App() {
  const source = useSelector((state) => state.appModule);

  return <Module name="app.js" source={source} defaultExport />;
}

export default React.memo(App);
