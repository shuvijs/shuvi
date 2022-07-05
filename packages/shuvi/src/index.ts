/// <reference path="../types/plugin-extended.d.ts" />

export * from '@shuvi/platform-web/lib/types/resources';

export {
  defineConfig,
  Config,
  createPlugin,
  createServerPlugin
} from '@shuvi/service';
export { createPlugin as createRuntimePlugin } from '@shuvi/platform-shared/lib/runtime';
