import { IncomingMessage, ServerResponse } from 'http';
import { isRedirect, isError } from '@shuvi/platform-shared/lib/runtime';
import {
  IRequest,
  IRequestHandlerWithNext,
  IServerPluginContext
} from '@shuvi/service';

import { sendHTML } from '@shuvi/service/lib/server/utils';
import { renderToHTML } from './renderToHTML';

function initServerRender(serverPluginContext: IServerPluginContext) {
  return async function (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string | null> {
    const result = await renderToHTML({
      req: req as IRequest,
      serverPluginContext
    });

    if (isRedirect(result)) {
      res.writeHead(result.status, {
        Location: result.headers.get('Location')!
      });
      res.end();
      return null;
    }

    if (isError(result)) {
      res.statusCode = result.status;
    }

    return result.body;
  };
}

export function getSSRMiddleware(
  api: IServerPluginContext
): IRequestHandlerWithNext {
  const serverRender = initServerRender(api);
  return async function (req, res, next) {
    try {
      const renderToHTML = await api.serverPluginRunner.renderToHTML(
        serverRender
      );
      const html = await renderToHTML(req, res);
      if (html) {
        // send the response
        sendHTML(req, res, html);
      }
    } catch (error) {
      next(error);
    }
  };
}
