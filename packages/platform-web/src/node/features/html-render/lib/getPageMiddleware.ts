import { IncomingMessage, ServerResponse } from 'http';
import {
  ShuviRequest,
  ShuviRequestHandler,
  IServerPluginContext
} from '@shuvi/service';
import { sendHTML as originalSendHtml } from '@shuvi/service/lib/server/utils';
import { Response, isRedirect, isText } from '@shuvi/platform-shared/shared';
import { IHandlePageRequest, RequestContext, ISendHtml } from '../serverHooks';
import { renderToHTML } from './renderToHTML';

function createPageHandler(serverPluginContext: IServerPluginContext) {
  const {
    traces: { serverRequestTrace }
  } = serverPluginContext;
  const wrappedSendHtml = async (
    html: string,
    { req, res }: RequestContext
  ) => {
    const sendHtmlOriginalTrace = serverRequestTrace.traceChild(
      'SHUVI_SERVER_SEND_HTML_ORIGINAL'
    );
    originalSendHtml(req, res, html);
    sendHtmlOriginalTrace.stop();
  };

  let sendHtml: ISendHtml;
  let pendingSendHtml: Promise<ISendHtml>;

  return async function (req: IncomingMessage, res: ServerResponse) {
    const result = await serverRequestTrace
      .traceChild('SHUVI_SERVER_RENDER_TO_HTML')
      .traceAsyncFn(() =>
        renderToHTML({
          req: req as ShuviRequest,
          serverPluginContext
        })
      );

    if (isRedirect(result)) {
      const redirectResp = result as Response;
      res.writeHead(redirectResp.status, {
        Location: redirectResp.headers.get('Location')!
      });
      res.end();
    } else if (isText(result)) {
      const textResp = result as Response;
      res.statusCode = textResp.status;

      if (!sendHtml) {
        if (!pendingSendHtml) {
          pendingSendHtml =
            serverPluginContext.serverPluginRunner.sendHtml(wrappedSendHtml);
        }
        sendHtml = await pendingSendHtml;
      }
      const {
        traces: { serverRequestTrace }
      } = serverPluginContext;
      const sendHtmlHookTrace = serverRequestTrace.traceChild(
        'SHUVI_SERVER_SEND_HTML_HOOK'
      );
      await sendHtml(textResp.data, { req, res });
      sendHtmlHookTrace.stop();
    } else {
      // shuold never reach here
      throw new Error('Unexpected reponse type from renderToHTML');
    }
  };
}

export async function getPageMiddleware(
  api: IServerPluginContext
): Promise<ShuviRequestHandler> {
  const defaultPageHandler = createPageHandler(api);
  let pageHandler: IHandlePageRequest;
  let pendingPageHandler: Promise<IHandlePageRequest>;

  return async function (req, res, next) {
    const {
      traces: { serverRequestTrace }
    } = api;
    const runPageMiddlewareTrace = serverRequestTrace.traceChild(
      'SHUVI_SERVER_RUN_PAGE_MIDDLEWARE'
    );
    if (!pageHandler) {
      if (!pendingPageHandler) {
        pendingPageHandler =
          api.serverPluginRunner.handlePageRequest(defaultPageHandler);
      }
      pageHandler = await pendingPageHandler;
    }

    try {
      await pageHandler(req, res);
      runPageMiddlewareTrace.setAttribute('error', false);
      runPageMiddlewareTrace.setAttribute('statusCode', res.statusCode);
      runPageMiddlewareTrace.stop();
    } catch (error) {
      runPageMiddlewareTrace.setAttribute('error', true);
      runPageMiddlewareTrace.setAttribute('statusCode', res.statusCode);
      runPageMiddlewareTrace.stop();
      next(error);
    }
  };
}
