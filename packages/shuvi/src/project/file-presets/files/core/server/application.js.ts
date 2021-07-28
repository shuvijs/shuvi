import { ProjectContext } from '../../../../projectContext';
import { moduleExportProxyCreater } from '../../../../file-snippets';

const moduleExportProxy = moduleExportProxyCreater();

export default {
  content: (context: ProjectContext) =>
    moduleExportProxy.getContent(context.runtimeCoreModule.server.application)
};
