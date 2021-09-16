import { ProjectContext } from '../../../projectContext';

export default {
  content: (context: ProjectContext) => {
    const plugins = context.runtimePlugins;
    let pluginRecord = '';
    let content = '';
    plugins.forEach((value, name) => {
      content += `import ${name} from "${value}"\n`;
      pluginRecord += `${name},`;
    });
    content += `const pluginRecord = {${pluginRecord}}\n`;
    content += `export { pluginRecord };`;
    return content;
  }
};
