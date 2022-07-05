import { createPlugin, IRouteConfig } from '@shuvi/service';
import {
  getAllFiles,
  getFirstModuleExport,
  getUserCustomFileCandidates
} from '@shuvi/service/lib/project/file-utils';
import { buildToString } from '@shuvi/toolpack/lib/utils/build-loaders';
import * as fs from 'fs';
import * as path from 'path';
import { extendedHooks } from './hooks';
import { ifComponentHasLoader } from './lib';
import { getRoutes } from '../filesystem-routes';

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
  addRuntimeFile: ({ createFile }, context) => {
    const {
      config: {
        router: { history }
      },
      paths
    } = context;
    const routerConfigFile = createFile({
      name: 'routerConfig.js',
      content: () => {
        return `export const historyMode = "${history}";`;
      }
    });

    const loadersFile = createFile({
      name: 'loaders.js',
      content: async () => {
        // fixme: await dependencies
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
        const routes = getRoutes();
        const loaders: Record<string, string> = {};
        const traverseRoutes = (routes: IRouteConfig[]) => {
          routes.forEach(r => {
            const { component, id, children } = r;
            if (component && id) {
              const hasLoader = ifComponentHasLoader(component);
              if (hasLoader) {
                loaders[id] = component;
              }
            }
            if (children) {
              traverseRoutes(children);
            }
          });
        };
        traverseRoutes(routes);
        let imports = '';
        let exports = '';
        Object.entries(loaders).forEach((loader, index) => {
          const [id, component] = loader;
          imports += `import { loader as loader_${index} } from '${component}'\n`;
          exports += `'${id}': loader_${index},\n`;
        });
        return `${imports}  export default {\n  ${exports}\n}`;
      },
      dependencies: [
        paths.routesDir,
        path.join(paths.appDir, 'files', 'routes.js')
      ]
    });
    const documentCandidates = getUserCustomFileCandidates(
      paths.rootDir,
      'document',
      'noop'
    );
    const userDocumentFile = createFile({
      name: 'user/document.js',
      content: () => {
        return getFirstModuleExport(
          getAllFiles(documentCandidates),
          documentCandidates
        );
      },
      dependencies: documentCandidates
    });

    const loadersFileName = path.join(
      context.paths.appDir,
      'files',
      'loaders.js'
    );
    const pageLoadersFile = createFile({
      name: 'page-loaders.js',
      content: async () => {
        // fixme: await dependencies
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 1500);
        });

        if (fs.existsSync(loadersFileName)) {
          return await buildToString(loadersFileName);
        }
        return '';
      },
      dependencies: [paths.routesDir, loadersFileName]
    });

    return [userDocumentFile, routerConfigFile, loadersFile, pageLoadersFile];
  }
});

export default {
  core,
  types: path.join(__dirname, 'types')
};
