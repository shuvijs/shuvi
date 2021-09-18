import { moduleExportProxy } from '../../file-snippets';
import { ProjectContext } from '../../projectContext';

export default {
  content: (context: ProjectContext) =>
    moduleExportProxy(context.serverModule.entry)
};
