import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import ModuleProxy from './files/ModuleProxy';
import { useSelector } from '../models/store';

function Plugin() {
  const source = useSelector(state => state.pluginModule);
  const plugins = useSelector(state => state.runtimePlugins);

  let pluginsHash = '';
  let content = '';

  plugins.forEach((value, name) => {
    content += `import ${name} from "${value}"\n`;
    pluginsHash += `${name},`;
  });

  content += `let plugins = {${pluginsHash}}\n`;
  content += `export default plugins;`;

  return (
    <>
      <File name="pluginsHash.js" content={content} />
      <ModuleProxy name="plugin.js" source={source} defaultExport />
    </>
  );
}

export default observer(Plugin);
