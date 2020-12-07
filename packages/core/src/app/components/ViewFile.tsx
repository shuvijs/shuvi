import { observer } from 'mobx-react';
import { useSelector } from '../models/store';
import ModuleProxy from './files/ModuleProxy';

function Renderer() {
  const module = useSelector(state => state.viewModule);

  return <ModuleProxy name="view.js" source={module} defaultExport />;
}

export default observer(Renderer);
