import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import { useSelector } from '../models/store';

function Plugins() {
  const plugins = useSelector(state => state.runtimePlugins);

  let content = '';
  let functionContent = '';

  plugins.forEach((value, name) => {
    content += `import ${name} from "${value}"\n`;
    functionContent += `${name}(application)\n`;
  });

  content += `export default (application) => {
${functionContent}}`;

  return <File name="plugins.js" content={content} />;
}

export default observer(Plugins);
