import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import { useSelector } from '../models/store';

function PluginsHash() {
  const plugins = useSelector(state => state.runtimePlugins);

  let pluginsHash = '';
  let content = '';

  plugins.forEach((value, name) => {
    content += `import ${name} from "${value}"\n`;
    pluginsHash += `${name},`;
  });

  content += `let plugins = {${pluginsHash}}\n`;
  content += `export default plugins;`;

  return <File name="pluginsHash.js" content={content} />;
}

export default observer(PluginsHash);
