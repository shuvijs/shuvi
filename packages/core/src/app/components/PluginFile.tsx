import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import ModuleProxy from './files/ModuleProxy';
import { useSelector } from '../models/store';

function Plugin() {
  const source = useSelector(state => state.pluginModule);
  const plugins = useSelector(state => state.runtimePlugins);

  let pluginRecord = '';
  let content = '';

  plugins.forEach((value, name) => {
    content += `import ${name} from "${value}"\n`;
    pluginRecord += `${name},`;
  });

  content += `const pluginRecord = {${pluginRecord}}\n`;
  content += `export { pluginRecord };`;

  return (
    <>
      <File name="plugins.js" content={content} />
      <ModuleProxy name="plugin.js" source={source} defaultExport />
    </>
  );
}

export default observer(Plugin);
