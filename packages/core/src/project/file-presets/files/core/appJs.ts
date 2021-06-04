import fileSnippetUtil from '../../../file-snippet-util';
import { ProjectContext } from '../../../projectContext';

const moduleExportProxy = fileSnippetUtil.moduleExportProxyCreater();
export default {
  name: 'core/app.js',
  content: (context: ProjectContext) =>
    moduleExportProxy.getContent(context.appModule, true),
  mounted: moduleExportProxy.mounted,
  unmounted: moduleExportProxy.unmounted
};
