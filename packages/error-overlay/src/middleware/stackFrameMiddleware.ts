import { StackFrame } from 'stacktrace-parser';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

import type { webpack } from '@shuvi/toolpack/lib/webpack';
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
  buildDefaultDir: string,
  buildServerDir: string
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
    cache: Map<string, Source | null>,
    buildDir: string
  ): Promise<void> => {
    await Promise.all(
      files.map(async fileName => {
        try {
          const moduleId = fileName.replace(
            /^(webpack-internal:\/\/\/|file:\/\/)/,
            ''
          );

          const source = await getSourceById(
            fileName.startsWith('file:'),
            moduleId,
            compiler,
            resolveBuildFile,
            buildDir,
            compilation
          );

          cache.set(fileName, source);
        } catch {
          cache.set(fileName, null);
        }
      })
    );
  };

  const getStackFrames = async (
    frames: StackFrame[],
    errorMessage: string | undefined,
    compilation: webpack.Compilation | undefined,
    sourceMap: Map<string, Source | null>,
    buildDir: string
  ): Promise<OriginalStackFrame[]> => {
    return await Promise.all(
      frames.map(async (frame: StackFrame) => {
        let result;
        try {
          result = await getOriginalStackFrame(
            frame,
            sourceMap,
            resolveBuildFile,
            buildDir,
            errorMessage,
            compilation
          );
        } catch {
          result = {
            error: true,
            reason: 'No Content',
            external: false,
            expanded: false,
            sourceStackFrame: frame,
            originalStackFrame: null,
            originalCodeFrame: null
          };
        }
        return result;
      })
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
    const sourceMap = new Map<string, Source | null>();
    const { query: queryFromUrl } = url.parse(req.url!, true);
    const query = queryFromUrl as unknown as {
      frames: string;
      isServer: string;
      errorMessage: string | undefined;
    };

    const frames: StackFrame[] = JSON.parse(query.frames as string);
    const { isServer, errorMessage } = query;
    const compiler =
      isServer === 'true'
        ? bundler.getSubCompiler(BUNDLER_TARGET_SERVER)
        : bundler.getSubCompiler(BUNDLER_TARGET_CLIENT);
    const compilation =
      isServer === 'true' ? serverStats?.compilation : clientStats?.compilation;
    const buildDir = isServer === 'true' ? buildServerDir : buildDefaultDir;

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

    // collect the sourcemaps from the files
    await collectSourceMaps(files, compiler, compilation, sourceMap, buildDir);

    // handle the source position
    const originalStackFrames = await getStackFrames(
      frames,
      errorMessage,
      compilation,
      sourceMap,
      buildDir
    );

    sourceMap.clear();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.write(Buffer.from(JSON.stringify(originalStackFrames)));
    res.end();
  };
}
