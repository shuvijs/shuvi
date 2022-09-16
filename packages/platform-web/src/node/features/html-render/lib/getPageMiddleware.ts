import { IncomingMessage, ServerResponse } from 'http';
import {
  ShuviRequest,
  ShuviRequestHandler,
  IServerPluginContext
} from '@shuvi/service';
import { sendHTML } from '@shuvi/service/lib/server/utils';
import { Response, isRedirect, isText } from '@shuvi/platform-shared/shared';
import { IHandlePageRequest } from '../serverHooks';
import { renderToHTML } from './renderToHTML';

function createPageHandler(serverPluginContext: IServerPluginContext) {
  return async function (req: IncomingMessage, res: ServerResponse) {
    const result = await renderToHTML({
      req: req as ShuviRequest,
      serverPluginContext
    });

    if (isRedirect(result)) {
      const redirectResp = result as Response;
      res.writeHead(redirectResp.status, {
        Location: redirectResp.headers.get('Location')!
      });
      res.end();
    } else if (isText(result)) {
      const textResp = result as Response;
      res.statusCode = textResp.status;
      sendHTML(req, res, textResp.data);
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

  return async function (req, res, next) {
    if (!pageHandler) {
      pageHandler = await api.serverPluginRunner.handlePageRequest(
        defaultPageHandler
      );
    }

    try {
      await pageHandler(req, res);
    } catch (error) {
      next(error);
    }
  };
}
