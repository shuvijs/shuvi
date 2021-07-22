import { moduleExportProxy } from '../../file-snippets';
import { ProjectContext } from '../../projectContext';
const _servicesMap = new Map<string, string>();
export default {
  // consume message function
  content: (context: ProjectContext) => {
    const services = context.services;
    while (services.length) {
      const [
        addFile,
        source,
        exported,
        filePath,
        useTypeScript
      ] = services.shift()!;
      // check filePath
      if (_servicesMap.has(filePath)) {
        console.warn(`filePath:${filePath} has exist, try other filePath`);
      }
      const fileContent = moduleExportProxy(source, !exported, exported);
      _servicesMap.set(filePath, fileContent);
      const extensions = ['.js'];
      if (useTypeScript) {
        extensions.push('.ts');
      }
      extensions.forEach(extension => {
        addFile({
          name: `${filePath}${extension}`,
          content: () => fileContent
        });
      });
    }
  }
};
