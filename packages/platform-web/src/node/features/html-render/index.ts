import { createPlugin } from '@shuvi/service';
import { resolvePkgFile } from '../../paths';
import server from './server';

export {
  getPageMiddleware,
  IHtmlDocument,
  ITemplateData,
  IViewServer,
  IViewClient
} from './lib';

const core = createPlugin({
  addRuntimeFile: ({ defineFile }, context) => {
    const {
      config: {
        router: { history }
      }
    } = context;
    const routerConfigFile = defineFile({
      name: 'routerConfig.js',
      content: () => {
        return `export const historyMode = "${history}";`;
      }
    });

    return [routerConfigFile];
  }
});

export default {
  core,
  server,
  types: resolvePkgFile('lib/node/features/html-render/shuvi-app.d.ts')
};
