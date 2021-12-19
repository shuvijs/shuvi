import { IncomingMessage, ServerResponse } from 'http';
import {
  IRequest,
  IRequestHandlerWithNext,
  IPluginContext
} from '@shuvi/service';

import { sendHTML } from '@shuvi/service/lib/lib/utils';

import { renderToHTML } from './renderToHTML';

function initServerRender(serverPluginContext: IPluginContext) {
  return async function (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string | null> {
    const { html, appContext } = await renderToHTML({
      req: req as IRequest,
      serverPluginContext,
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

    serverPluginContext.pluginRunner.onViewDone({
      req,
      res,
      html,
      appContext
    });

    return html;
  };
}

export function getSSRMiddleware(api: IPluginContext): IRequestHandlerWithNext {
  const serverRender = initServerRender(api);
  return async function (req, res, next) {
    try {
      const renderToHTML = await api.pluginRunner.renderToHTML(serverRender);
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
