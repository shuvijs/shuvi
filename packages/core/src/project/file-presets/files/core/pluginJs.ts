import fileSnippetUtil from '../../../file-snippet-util';
import { ProjectContext } from '../../../projectContext';

const moduleExportProxy = fileSnippetUtil.moduleExportProxyCreater();
export default {
  name: 'core/plugin.js',
  content: (context: ProjectContext) =>
    moduleExportProxy.getContent(context.pluginModule, true),
  mounted: moduleExportProxy.mounted,
  unmounted: moduleExportProxy.unmounted
};
