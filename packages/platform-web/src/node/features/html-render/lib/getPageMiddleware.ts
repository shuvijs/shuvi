import { IncomingMessage, ServerResponse } from 'http';
import {
  IRequest,
  IRequestHandlerWithNext,
  IServerPluginContext
} from '@shuvi/service';
import { sendHTML } from '@shuvi/service/lib/server/utils';
import { renderToHTML } from './renderToHTML';
import {
  Response,
  isRedirect,
  isText
} from '@shuvi/platform-shared/src/shared';

function createPageHandler(serverPluginContext: IServerPluginContext) {
  return async function (req: IncomingMessage, res: ServerResponse) {
    const result = await renderToHTML({
      req: req as IRequest,
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

export function getPageMiddleware(
  api: IServerPluginContext
): IRequestHandlerWithNext {
  let pageHandler = createPageHandler(api);
  return async function (req, res, next) {
    try {
      pageHandler = await api.serverPluginRunner.handlePageRequest(pageHandler);
      await pageHandler(req, res);
    } catch (error) {
      next(error);
    }
  };
}
