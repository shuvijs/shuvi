import { StackFrame } from 'stacktrace-parser';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

import type webpack from '@shuvi/toolpack/lib/webpack';
import {
  BUNDLER_TARGET_CLIENT,
  BUNDLER_TARGET_SERVER
} from '@shuvi/shared/lib/constants';

import { getSourceById, Source } from './helper/getSourceById';
import { getOriginalStackFrame } from './helper/getOriginalStackFrame';

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
      const files: string[] = [];
      const cache = new Map<string, Source>();
      const { query: queryFromUrl } = url.parse(req.url!, true);
      const query = queryFromUrl as unknown as {
        frames: string;
        isServer: Boolean;
        errorMessage: string | undefined;
      };

      const frames: StackFrame[] = JSON.parse(query.frames as string);
      const { isServer, errorMessage } = query;
      const compiler = isServer
        ? bundler.getSubCompiler(BUNDLER_TARGET_SERVER)
        : bundler.getSubCompiler(BUNDLER_TARGET_CLIENT);
      const compilation = isServer
        ? serverStats?.compilation
        : clientStats?.compilation;

      // handle duplicate files
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

      // handle the source from the file
      for (const fileName of files) {
        const moduleId: string = resolveBuildFile(
          buildDefaultDir,
          fileName.replace(/^(webpack-internal:\/\/\/|file:\/\/)/, '')
        );
        try {
          const source = await getSourceById(
            fileName.startsWith('file:'),
            moduleId,
            compiler,
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

      // handle the source position
      const originalStackFrames = await Promise.all(
        frames.map(async (frame: StackFrame) =>
          getOriginalStackFrame(
            frame,
            cache,
            resolveBuildFile,
            buildDefaultDir,
            errorMessage,
            compilation
          )
        )
      );

      try {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(Buffer.from(JSON.stringify(originalStackFrames)));
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
