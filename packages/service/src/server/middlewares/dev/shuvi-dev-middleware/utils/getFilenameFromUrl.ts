import * as path from 'path';
import { parse } from 'url';
import * as querystring from 'querystring';
import mem from 'mem';

import getPaths from './getPaths';
import { IContext } from '../types';

export default function getFilenameFromUrl(
  context: IContext,
  url: string
): string | undefined {
  const memoizedParse = mem(parse);
  const paths = getPaths(context);

  let filename;
  let urlObject;

  try {
    // The `url` property of the `request` is contains only  `pathname`, `search` and `hash`
    urlObject = memoizedParse(url, false, true);
  } catch (_ignoreError) {
    return filename;
  }

  for (const { publicPath, outputPath } of paths) {
    let publicPathObject;

    try {
      publicPathObject = memoizedParse(publicPath, false, true);
    } catch (_ignoreError) {
      continue;
    }

    if (
      urlObject.pathname &&
      typeof publicPathObject.pathname === 'string' &&
      urlObject.pathname.startsWith(publicPathObject.pathname)
    ) {
      filename = outputPath;

      // Strip the `pathname` property from the `publicPath` option from the start of requested url
      // `/complex/foo.js` => `foo.js`
      const pathname = urlObject.pathname.substring(
        publicPathObject.pathname.length
      );

      if (pathname) {
        filename = path.join(outputPath, querystring.unescape(pathname));
      }

      let fsStats;

      try {
        fsStats = context.outputFileSystem?.statSync(filename);
      } catch (_ignoreError) {
        continue;
      }

      if (fsStats?.isFile()) {
        break;
      } else if (fsStats?.isDirectory()) {
        const indexValue = 'index.html';

        filename = path.join(filename, indexValue);

        try {
          fsStats = context.outputFileSystem?.statSync(filename);
        } catch (__ignoreError) {
          continue;
        }

        if (fsStats?.isFile()) {
          break;
        }
      }
    }
  }

  return filename;
}
