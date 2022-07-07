import { createPlugin } from '@shuvi/service';
import {
  getAllFiles,
  getFirstModuleExport,
  getUserCustomFileCandidates
} from '@shuvi/service/lib/project/file-utils';
import * as path from 'path';
import { extendedHooks } from './hooks';

export { IRenderToHTML } from './hooks';
export {
  getSSRMiddleware,
  IDocumentProps,
  ITemplateData,
  IViewServer,
  IViewClient
} from './lib';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeFile: ({ defineFile }, context) => {
    const {
      config: {
        router: { history }
      },
      paths
    } = context;
    const routerConfigFile = defineFile({
      name: 'routerConfig.js',
      content: () => {
        return `export const historyMode = "${history}";`;
      }
    });

    const documentCandidates = getUserCustomFileCandidates(
      paths.rootDir,
      'document',
      'noop'
    );
    const userDocumentFile = defineFile({
      name: 'user/document.js',
      content: () => {
        return getFirstModuleExport(
          getAllFiles(documentCandidates),
          documentCandidates
        );
      },
      dependencies: documentCandidates
    });

    return [userDocumentFile, routerConfigFile];
  }
});

export default {
  core,
  // FIXME: should be a module path, not file path
  types: path.join(__dirname, 'types')
};
