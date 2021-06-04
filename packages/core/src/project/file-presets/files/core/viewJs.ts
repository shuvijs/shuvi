import fileSnippetUtil from '../../../file-snippet-util';
import { ProjectContext } from '../../../projectContext';

const moduleExportProxy = fileSnippetUtil.moduleExportProxyCreater();
export default {
  name: 'core/view.js',
  content: (context: ProjectContext) =>
    moduleExportProxy.getContent(context.viewModule, true),
  mounted: moduleExportProxy.mounted,
  unmounted: moduleExportProxy.unmounted
};
