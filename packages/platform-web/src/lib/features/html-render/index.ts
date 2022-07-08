import { createPlugin } from '@shuvi/service';
import * as path from 'path';
import { extendedHooks } from './hooks';

export { IHandlePageRequest } from './hooks';
export {
  getSSRMiddleware,
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
  // FIXME: should be a module path, not file path
  types: path.join(__dirname, 'types')
};
