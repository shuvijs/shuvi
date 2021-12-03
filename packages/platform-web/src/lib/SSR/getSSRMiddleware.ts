import { IncomingMessage, ServerResponse } from 'http';
import { IRequest, Api, IRequestHandlerWithNext } from '@shuvi/service';

import { sendHTML } from '@shuvi/service/lib/lib/utils';

import { renderToHTML } from './renderToHTML';
import { runner } from '../serverHooks';

function initServerRender(api: Api) {
  return async function (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string | null> {
    const { server } = api.resources.server;
    const { html, appContext } = await renderToHTML({
      req: req as IRequest,
      api,
      onRedirect(redirect) {
        res.writeHead(redirect.status ?? 302, { Location: redirect.path });
        res.end();
      }
    });

    // set 404 statusCode
    if (appContext.statusCode) {
      res.statusCode = appContext.statusCode;
    } else {
      res.statusCode = 200;
    }

    if (server.onViewDone) {
      server.onViewDone(req, res, { html, appContext });
    }

    return html;
  };
}

export function getSSRMiddleware(api: Api): IRequestHandlerWithNext {
  const serverRender = initServerRender(api);
  return async function (req, res, next) {
    try {
      const renderToHTML = await runner.renderToHTML(serverRender);
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
