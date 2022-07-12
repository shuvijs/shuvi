import { createPlugin } from '@shuvi/service';
import { extendedHooks } from './hooks';

export { IHandlePageRequest } from './hooks';
export {
  getPageMiddleware,
  IHtmlDocument,
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
  types: '@shuvi/platform-web/esm/node/features/html-render/shuvi-app'
};
