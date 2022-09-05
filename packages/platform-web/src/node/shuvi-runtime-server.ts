import { ShuviRequestHandler } from '@shuvi/service';
import { IServerModule as _IServerModule, IApiRequestHandler } from '../shared';
import { extendedHooks } from './features/html-render/serverHooks';

type Head<T extends any[]> = T extends [...infer Head, any] ? Head : never;
type RemoveLast<T extends (...args: any) => any> = (
  ...args: Head<Parameters<T>>
) => ReturnType<T>;

declare global {
  namespace ShuviService {
    interface CustomServerPluginHooks {
      getPageData: typeof extendedHooks.getPageData;
      handlePageRequest: typeof extendedHooks.handlePageRequest;
      modifyHtml: typeof extendedHooks.modifyHtml;
    }
  }
}

type ServerModule = Required<_IServerModule>;

// server runtime api
export type ShuviMiddlewareHandler = ShuviRequestHandler;

export type ShuviApiHandler = IApiRequestHandler;

// server hooks
export type GetPageDataFunction = RemoveLast<ServerModule['getPageData']>;

export type HandlePageRequestFunction = RemoveLast<
  ServerModule['handlePageRequest']
>;

export type ModifyHtmlFunction = RemoveLast<ServerModule['modifyHtml']>;
