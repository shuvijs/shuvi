import { IncomingMessage, ServerResponse } from 'http';
import {
  IRequest,
  IRequestHandlerWithNext,
  IServerPluginContext
} from '@shuvi/service';

import { sendHTML } from '@shuvi/service/lib/server/utils';

import { renderToHTML } from './renderToHTML';
import { IRenderResultRedirect, isRedirect } from './renderer';

function initServerRender(serverPluginContext: IServerPluginContext) {
  return async function (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string | null> {
    const onRedirect = (redirect: IRenderResultRedirect) => {
      res.writeHead(redirect.status ?? 302, { Location: redirect.path });
      res.end();
    };
    const { result, error } = await renderToHTML({
      req: req as IRequest,
      serverPluginContext
    });

    if (isRedirect(result)) {
      onRedirect(result);
      return null;
    }

    if (error) {
      res.statusCode = error.errorCode!;
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
