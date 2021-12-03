import { ProjectContext } from '../../../projectContext';
export default {
  content: (context: ProjectContext) => {
    const plugins = context.runtimePlugins;
    const pluginRecord: string[] = [];
    let content = '';
    plugins.forEach(({ plugin, options }, index) => {
      const name = `plugin${index}`;
      content += `import ${name}File from "${plugin}";
const ${name} = {
  plugin: ${name}File,
  options: '${JSON.stringify(options)}'
};\n`;
      pluginRecord.push(name);
    });
    content += `const pluginRecord = { ${pluginRecord.join(', ')} };\n`;
    content += `export { pluginRecord };`;
    return content;
  }
};
