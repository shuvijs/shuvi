export {
  getAppData,
  getPageData,
  getPublicPath,
  getFilesOfRoute,
  RouteFile,
  RouteFiles,
  IAppData,
  IData
} from './helper';

export * from './routerTypes';
export * from './router';
export * from './runtimeConfig';

export * from './applicationTypes';
export type { Application } from './application';

export {
  // todo: remove
  getModelManager,
  // todo: remove
  getErrorHandler,
  IAppState,
  IModelManager,
  IErrorHandler,
  IPageError,
  errorModel,
  redirectModel
} from './store';

export {
  IRuntimeModule,
  createPlugin,
  RuntimePluginInstance
} from './lifecycle';
