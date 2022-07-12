export {
  defineConfig,
  Config,
  createPlugin,
  createServerPlugin
} from '@shuvi/service';

// load types extensions
import '@shuvi/platform-shared/node/index';

export { createPlugin as createRuntimePlugin } from '@shuvi/platform-shared/shared';
export * from '@shuvi/platform-web/node/types/shuvi-service';
