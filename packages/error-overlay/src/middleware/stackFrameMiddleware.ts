import { StackFrame } from 'stacktrace-parser';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

import type webpack from '@shuvi/toolpack/lib/webpack';
import {
  BUNDLER_TARGET_CLIENT,
  BUNDLER_TARGET_SERVER
} from '@shuvi/shared/lib/constants';

import { getSourceById, Source } from './helper/getSourceById';
import { createOriginalStackFrame } from './helper/createOriginalStackFrame';

export function stackFrameMiddleware(
  originalStackFrameEndpoint: string,
  bundler: any,
  resolveBuildFile: (...paths: string[]) => string,
  buildDefaultDir: string
) {
  let clientStats: webpack.Stats | null = null;
  let serverStats: webpack.Stats | null = null;
  const files: string[] = [];
  const cache = new Map<string, Source>();

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
      const { query: queryFromUrl } = url.parse(req.url!, true);
      const query = queryFromUrl as unknown as {
        frames: string;
        isServer: Boolean;
        errorMessage: string | undefined;
      };

      const frames: StackFrame[] = JSON.parse(query.frames as string);
      const { isServer, errorMessage } = query;
      const compilation = isServer
        ? serverStats?.compilation
        : clientStats?.compilation;

      frames.forEach((frame: StackFrame) => {
        const { file } = frame;
        if (file == null) {
          return;
        }
        if (files.indexOf(file) !== -1) {
          return;
        }
        files.push(file);
      });

      for (const fileName of files) {
        const moduleId: string = resolveBuildFile(
          buildDefaultDir,
          fileName.replace(/^(webpack-internal:\/\/\/|file:\/\/)/, '')
        );
        try {
          const source = await getSourceById(
            fileName.startsWith('file:'),
            moduleId,
            compilation
          );
          cache.set(fileName, source);
        } catch (err) {
          console.log('Failed to get source map:', err);
          res.statusCode = 500;
          res.write('Internal Server Error');
          res.end();
          return;
        }
      }

      const originalStackFrameResponses = await Promise.all(
        frames.map(async (frame: StackFrame) => {
          if (
            !(
              frame.file?.startsWith('webpack-internal:') ||
              frame.file?.startsWith('file:')
            )
          ) {
            return {
              error: false,
              reason: null,
              external: true,
              expanded: false,
              sourceStackFrame: frame,
              originalStackFrame: null,
              originalCodeFrame: null
            };
          }

          if (cache.get(frame.file) === null) {
            return {
              error: true,
              reason: 'No Content',
              external: false,
              expanded: false,
              sourceStackFrame: frame,
              originalStackFrame: null,
              originalCodeFrame: null
            };
          }

          const frameLine = parseInt(frame.lineNumber?.toString() ?? '', 10);
          let frameColumn: number | null = parseInt(
            frame.column?.toString() ?? '',
            10
          );
          if (!frameColumn) {
            frameColumn = null;
          }
          const originalStackFrameResponse = await createOriginalStackFrame({
            line: frameLine,
            column: frameColumn,
            source: cache.get(frame.file),
            frame,
            modulePath: resolveBuildFile(
              buildDefaultDir,
              frame.file.replace(/^(file:\/\/)/, '')
            ),
            errorMessage,
            compilation
          });
          if (originalStackFrameResponse === null) {
            return {
              error: true,
              reason: 'No Content',
              external: false,
              expanded: false,
              sourceStackFrame: frame,
              originalStackFrame: null,
              originalCodeFrame: null
            };
          }
          return {
            error: false,
            reason: null,
            external: false,
            expanded: !Boolean(
              /* collapsed */
              (frame.file?.includes('node_modules') ||
                originalStackFrameResponse.originalStackFrame?.file?.includes(
                  'node_modules'
                )) ??
                true
            ),
            sourceStackFrame: frame,
            originalStackFrame: originalStackFrameResponse.originalStackFrame,
            originalCodeFrame:
              originalStackFrameResponse.originalCodeFrame || null
          };
        })
      );

      try {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(Buffer.from(JSON.stringify(originalStackFrameResponses)));
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
