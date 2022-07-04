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

export {
  // todo: remove
  getStoreManager,
  // todo: remove
  getErrorHandler,
  IAppState,
  IStoreManager,
  IErrorHandler,
  IPageError,
  errorModel
} from './store';

export {
  IRuntimeModule,
  createPlugin,
  RuntimePluginInstance
} from './lifecycle';

export type { IRouteLoaderContext } from './context/routeLoaderContext';
export * from './applicationTypes';
export type { Application } from './application';
