import { moduleExportProxyCreater } from '../../../file-snippets';
import { ProjectContext } from '../../../projectContext';

const moduleExportProxy = moduleExportProxyCreater();
export default {
  content: (context: ProjectContext) =>
    moduleExportProxy.getContent(context.userModule.plugin, true),
  mounted: moduleExportProxy.mounted,
  unmounted: moduleExportProxy.unmounted
};
