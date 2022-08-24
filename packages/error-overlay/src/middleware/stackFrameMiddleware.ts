import { StackFrame } from 'stacktrace-parser';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

import type webpack from '@shuvi/toolpack/lib/webpack';
import {
  BUNDLER_TARGET_CLIENT,
  BUNDLER_TARGET_SERVER
} from '@shuvi/shared/lib/constants';

import { getSourceById, Source } from './helper/getSourceById';
import {
  getOriginalStackFrame,
  OriginalStackFrame
} from './helper/getOriginalStackFrame';

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

  const collectSourceMaps = async (
    files: string[],
    compiler: webpack.Compiler,
    compilation: webpack.Compilation | undefined,
    cache: Map<string, Source>
  ) => {
    await Promise.all(
      files.map(async fileName => {
        const moduleId: string = resolveBuildFile(
          buildDefaultDir,
          fileName.replace(/^(webpack-internal:\/\/\/|file:\/\/)/, '')
        );

        const source = await getSourceById(
          fileName.startsWith('file:'),
          moduleId,
          compiler,
          compilation
        );
        cache.set(fileName, source);
      })
    );
  };

  const getStackFrames = async (
    frames: StackFrame[],
    errorMessage: string | undefined,
    compilation: webpack.Compilation | undefined,
    sourceMap: Map<string, Source>
  ): Promise<OriginalStackFrame[]> => {
    return await Promise.all(
      frames.map(async (frame: StackFrame) =>
        getOriginalStackFrame(
          frame,
          sourceMap,
          resolveBuildFile,
          buildDefaultDir,
          errorMessage,
          compilation
        )
      )
    );
  };

  return async function (
    req: IncomingMessage,
    res: ServerResponse,
    next: Function
  ) {
    if (!req.url!.startsWith(originalStackFrameEndpoint)) {
      return next();
    }

    const files: string[] = [];
    const sourceMap = new Map<string, Source>();
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

    try {
      // collect the sourcemaps from the files
      await collectSourceMaps(files, compiler, compilation, sourceMap);
      // handle the source position
      const originalStackFrames = await getStackFrames(
        frames,
        errorMessage,
        compilation,
        sourceMap
      );

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.write(Buffer.from(JSON.stringify(originalStackFrames)));
    } catch (err) {
      res.statusCode = 500;
      res.write('Internal Server Error');
    } finally {
      sourceMap.clear();
    }

    res.end();
  };
}
