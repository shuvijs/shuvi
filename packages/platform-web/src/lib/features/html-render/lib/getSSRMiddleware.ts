import { IncomingMessage, ServerResponse } from 'http';
import {
  IRequest,
  IRequestHandlerWithNext,
  IServerPluginContext
} from '@shuvi/service';

import { sendHTML } from '@shuvi/service/lib/server/utils';

import { renderToHTML } from './renderToHTML';
import { isRedirect } from './renderer';

function initServerRender(serverPluginContext: IServerPluginContext) {
  return async function (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string | null> {
    const { result, error } = await renderToHTML({
      req: req as IRequest,
      serverPluginContext
    });

    if (isRedirect(result)) {
      res.writeHead(result.status ?? 302, { Location: result.path });
      res.end();
      return null;
    }

    if (error) {
      res.statusCode = error.code!;
    }

    return result;
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
