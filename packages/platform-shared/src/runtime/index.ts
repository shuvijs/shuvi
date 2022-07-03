export * from './helper';
export * from './routerTypes';
export * from './router';
export * from './runtimeConfig';

export * from './applicationTypes';
export type { Application } from './application';

export {
  // todo: remove
  getModelManager,
  // todo: remove
  IAppState,
  IModelManager,
  IPageError,
  errorModel,
  redirectModel
} from './store';

export {
  IRuntimeModule,
  createPlugin,
  RuntimePluginInstance
} from './lifecycle';
