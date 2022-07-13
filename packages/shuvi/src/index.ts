export {
  defineConfig,
  Config,
  createPlugin,
  createServerPlugin
} from '@shuvi/service';

// load types extensions
import '@shuvi/platform-shared/node/index';
import '@shuvi/platform-web/node/types/shuvi-service';
