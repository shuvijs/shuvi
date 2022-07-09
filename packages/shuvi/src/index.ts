/// <reference path="../types/shuvi-app.d.ts" />

export * from '@shuvi/platform-web/lib/types/shuvi-service';

export {
  defineConfig,
  Config,
  createPlugin,
  createServerPlugin
} from '@shuvi/service';
export { createPlugin as createRuntimePlugin } from '@shuvi/platform-shared/lib/runtime';
