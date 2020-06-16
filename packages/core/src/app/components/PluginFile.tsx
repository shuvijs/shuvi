import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import { useSelector } from '../models/store';

function Plugin() {
  const plugins = useSelector(state => state.runtimePlugins);

  let content = 'import initPlugins from "@shuvi/app/core/userPlugin"\n';
  let pluginsHash = '';

  plugins.forEach((value, name) => {
    content += `import ${name} from "${value}"\n`;
    pluginsHash += `${name},`;
  });

  content += `let plugins = {${pluginsHash}}\n`;

  content += `export default (tap) => {
if(typeof initPlugins === 'function'){
  initPlugins({
    registerPlugin: tap,
    applyPluginOption: (name, options) => {
      let pluginSelected = plugins[name]
      if(!pluginSelected){
        console.warn('['+ name +'] plugin is being applied options but does not match plugins in "shuvi.config.js".')
      } else {
        plugins[name].options = options
      }
    }
  })
}

Object.values(plugins).forEach(fn => fn(tap, fn.options));
}`;

  return <File name="plugin.js" content={content} />;
}

export default observer(Plugin);
