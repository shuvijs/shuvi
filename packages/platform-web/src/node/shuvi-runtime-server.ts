import {
  ShuviRequestHandler,
  ServerPluginConstructor as _ServerPluginConstructor
} from '@shuvi/service';
import { IApiRequestHandler } from '../shared';
import { extendedHooks } from './features/html-render/serverHooks';
import type { IHtmlDocument } from './features/html-render/lib/renderer/types';

declare global {
  namespace ShuviService {
    interface CustomServerPluginHooks {
      getPageData: typeof extendedHooks.getPageData;
      handlePageRequest: typeof extendedHooks.handlePageRequest;
      modifyHtml: typeof extendedHooks.modifyHtml;
      sendHtml: typeof extendedHooks.sendHtml;
    }
  }
}

type ServerPluginConstructor = Required<_ServerPluginConstructor>;

type Head<T extends any[]> = T extends [...infer Head, any] ? Head : never;
type RemoveLast<T extends (...args: any) => any> = (
  ...args: Head<Parameters<T>>
) => ReturnType<T>;

// server runtime api, used in page.js
export type ShuviMiddlewareHandler = ShuviRequestHandler;

export type ShuviApiHandler = IApiRequestHandler;

// server hooks, used in src/server.js
export type GetPageDataFunction = RemoveLast<
  ServerPluginConstructor['getPageData']
>;

export type HandlePageRequestFunction = RemoveLast<
  ServerPluginConstructor['handlePageRequest']
>;

export type ModifyHtmlFunction = RemoveLast<
  ServerPluginConstructor['modifyHtml']
>;

/** indirect type of ModifyHtmlFunction */
export type { IHtmlDocument };

export type SendHtmlFunction = RemoveLast<ServerPluginConstructor['sendHtml']>;

export interface IServerModule {
  getPageData?: GetPageDataFunction;
  handlePageRequest?: HandlePageRequestFunction;
  modifyHtml?: ModifyHtmlFunction;
  sendHtml?: SendHtmlFunction;
}
