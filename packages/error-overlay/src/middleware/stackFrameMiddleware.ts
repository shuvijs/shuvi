import { StackFrame } from 'stacktrace-parser';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

import type webpack from '@shuvi/toolpack/lib/webpack';
import {
  BUNDLER_TARGET_CLIENT,
  BUNDLER_TARGET_SERVER
} from '@shuvi/shared/lib/constants';

import { getSourceById, Source } from './helper/getSourceById';
import { createOriginalStackFrame } from '../shared/helper/createOriginalStackFrame';

export function stackFrameMiddleware(
  originalStackFrameEndpoint: string,
  bundler: any,
  resolveBuildFile: (...paths: string[]) => string,
  buildDefaultDir: string
) {
  let clientStats: webpack.Stats | null = null;
  let serverStats: webpack.Stats | null = null;

  bundler
    .getSubCompiler(BUNDLER_TARGET_CLIENT)
    ?.hooks.done.tap(
      'stackFrameMiddlewareForClient',
      (stats: webpack.Stats) => {
        clientStats = stats;
      }
    );

  bundler
    .getSubCompiler(BUNDLER_TARGET_SERVER)
    ?.hooks.done.tap(
      'stackFrameMiddlewareForServer',
      (stats: webpack.Stats) => {
        serverStats = stats;
      }
    );

  return async function (
    req: IncomingMessage,
    res: ServerResponse,
    next: Function
  ) {
    if (req.url!.startsWith(originalStackFrameEndpoint)) {
      const { query } = url.parse(req.url!, true);
      const frame = query as unknown as StackFrame & {
        isServer: Boolean;
        errorMessage: string | undefined;
      };

      if (
        !(
          frame.file?.startsWith('file://') &&
          Boolean(parseInt(frame.lineNumber?.toString() ?? '', 10))
        )
      ) {
        res.statusCode = 400;
        res.write('Bad Request');
        res.end();
        return;
      }

      const moduleId: string = resolveBuildFile(
        buildDefaultDir,
        frame.file.replace(/^(file:\/\/)/, '')
      );

      let source: Source;
      const compilation = frame.isServer
        ? serverStats?.compilation
        : clientStats?.compilation;
      try {
        source = await getSourceById(
          frame.file.startsWith('file:'),
          moduleId,
          compilation
        );
      } catch (err) {
        console.log('Failed to get source map:', err);
        res.statusCode = 500;
        res.write('Internal Server Error');
        res.end();
        return;
      }

      if (source == null) {
        res.statusCode = 204;
        res.write('No Content');
        res.end();
        return;
      }

      const frameLine = parseInt(frame.lineNumber?.toString() ?? '', 10);
      let frameColumn: number | null = parseInt(
        frame.column?.toString() ?? '',
        10
      );
      if (!frameColumn) {
        frameColumn = null;
      }

      try {
        const originalStackFrameResponse = await createOriginalStackFrame({
          line: frameLine,
          column: frameColumn,
          source,
          frame,
          modulePath: moduleId,
          errorMessage: frame.errorMessage,
          compilation
        });

        if (originalStackFrameResponse === null) {
          res.statusCode = 204;
          res.write('No Content');
          res.end();
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(Buffer.from(JSON.stringify(originalStackFrameResponse)));
        res.end();
        return;
      } catch (err) {
        console.log('Failed to parse source map:', err);
        res.statusCode = 500;
        res.write('Internal Server Error');
        res.end();
        return;
      }
    } else {
      next();
    }
  };
}
