import * as path from 'path';
import * as mime from 'mime-types';
import * as fs from 'fs';

import getFilenameFromUrl from './utils/getFilenameFromUrl';
import ready from './utils/ready';
import {
  IContext,
  IRequest,
  IResponse,
  IRequestHandlerWithNext
} from './types';

export default function wrapper(context: IContext): IRequestHandlerWithNext {
  return async function middleware(
    req: IRequest,
    res: IResponse,
    next: (err?: any) => void
  ) {
    const acceptedMethods = ['GET', 'HEAD'];

    if (!acceptedMethods.includes(req.method!)) {
      return await goNext();
    }

    ready(context, processRequest);

    async function goNext() {
      return new Promise(resolve => {
        ready(context, () => {
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
        content = fs.readFileSync(filename);
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

      res.setHeader('Content-Length', content.length);

      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(content);
      }
    }
  };
}
