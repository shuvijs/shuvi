export { getAppData, getPageData, IAppData, IData } from './helper';

export * from './routerTypes';
export * from './router';
export * from './runtimeConfig';

export {
  // todo: remove
  getModelManager,
  // todo: remove
  getErrorHandler,
  IAppState,
  IModelManager,
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
