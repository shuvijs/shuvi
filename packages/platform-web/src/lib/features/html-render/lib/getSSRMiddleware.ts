import { IncomingMessage, ServerResponse } from 'http';
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
    const { html,error } = await renderToHTML({
      req: req as IRequest,
      serverPluginContext,
      onRedirect(redirect) {
        res.writeHead(redirect.status ?? 302, { Location: redirect.path });
        res.end();
      }
    });

    if(error?.hasError && typeof error.errorCode === 'number') {
      res.statusCode = error.errorCode;
    }else {
      res.statusCode = 200;
    }

    return html;
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
