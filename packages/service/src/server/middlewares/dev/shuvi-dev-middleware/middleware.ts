import * as path from 'path';
import * as mime from 'mime-types';

import getFilenameFromUrl from './utils/getFilenameFromUrl';
import handleRangeHeaders from './utils/handleRangeHeaders';
import ready from './utils/ready';
import {
  IContext,
  IRequest,
  IExtendedResponse,
  IRequestHandlerWithNext
} from './types';

export default function wrapper(context: IContext): IRequestHandlerWithNext {
  return async function middleware(
    req: IRequest,
    res: IExtendedResponse,
    next: (err?: any) => void
  ) {
    const acceptedMethods = ['GET', 'HEAD'];

    res.locals = {};
    if (!acceptedMethods.includes(req.method!)) {
      return await goNext();
    }

    ready(context, processRequest);

    async function goNext() {
      return new Promise(resolve => {
        ready(context, () => {
          res.locals.webpack = { devMiddleware: context };
          resolve(next());
        });
      });
    }

    async function processRequest() {
      const filename = getFilenameFromUrl(context, req.url);
      let content;

      if (!filename) {
        await goNext();
        return;
      }

      try {
        content = context.outputFileSystem!.readFileSync(filename);
      } catch (_ignoreError) {
        await goNext();
        return;
      }

      const contentTypeHeader = res.getHeader('Content-Type');

      if (!contentTypeHeader) {
        // content-type name(like application/javascript; charset=utf-8) or false
        const contentType = mime.contentType(path.extname(filename));

        // Only set content-type header if media type is known
        // https://tools.ietf.org/html/rfc7231#section-3.1.1.5
        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }
      }

      // Buffer
      content = handleRangeHeaders(content, req, res);

      res.setHeader('Content-Length', content.length);

      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(content);
      }
    }
  };
}
