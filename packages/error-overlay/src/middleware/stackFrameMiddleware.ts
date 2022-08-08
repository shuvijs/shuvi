import { codeFrameColumns } from '@babel/code-frame';
import { StackFrame } from 'stacktrace-parser';
import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import url from 'url';

import type webpack from '@shuvi/toolpack/lib/webpack';

import {
  getSourcePath,
  getModuleById,
  getSourceById,
  Source,
  findOriginalSourcePositionAndContent
} from './helper';

export type OriginalStackFrameResponse = {
  originalStackFrame: StackFrame;
  originalCodeFrame: string | null;
};

export async function createOriginalStackFrame({
  line,
  column,
  source,
  modulePath,
  rootDirectory,
  frame,
  errorMessage,
  compilation
}: {
  line: number;
  column: number | null;
  source: any;
  modulePath?: string;
  rootDirectory: string;
  frame: any;
  errorMessage?: string;
  compilation?: webpack.Compilation;
}): Promise<OriginalStackFrameResponse | null> {
  const match = errorMessage?.match(/'([^']+)' module/);
  const moduleNotFound = match && match[1];
  const result =
    moduleNotFound && compilation
      ? getModuleById(
          modulePath,
          compilation!
        )?.buildInfo?.importLocByPath?.get(moduleNotFound) ?? null
      : await findOriginalSourcePositionAndContent(source, {
          line,
          column
        });

  if (result === null) {
    return null;
  }

  const { sourcePosition, sourceContent } = result;

  if (!sourcePosition.source) {
    return null;
  }

  const filePath = path.resolve(
    rootDirectory,
    modulePath || getSourcePath(sourcePosition.source)
  );

  const originalFrame: StackFrame = {
    file: sourceContent
      ? path.relative(rootDirectory, filePath)
      : sourcePosition.source,
    lineNumber: sourcePosition.line,
    column: sourcePosition.column,
    methodName: frame.methodName,
    arguments: []
  };

  const originalCodeFrame: string | null =
    !(originalFrame.file?.includes('node_modules') ?? true) &&
    sourceContent &&
    sourcePosition.line
      ? (codeFrameColumns(
          sourceContent,
          {
            start: {
              line: sourcePosition.line,
              column: sourcePosition.column ?? 0
            }
          },
          { forceColor: true }
        ) as string)
      : null;

  return {
    originalStackFrame: originalFrame,
    originalCodeFrame
  };
}

export function stackFrameMiddleware(
  originalStackFrameEndpoint: string,
  rootDir: string,
  clientStats: webpack.Stats | null,
  serverStats: webpack.Stats | null
) {
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
          (frame.file?.startsWith('webpack-internal:///') ||
            frame.file?.startsWith('file://')) &&
          Boolean(parseInt(frame.lineNumber?.toString() ?? '', 10))
        )
      ) {
        res.statusCode = 400;
        res.write('Bad Request');
        res.end();
        return;
      }

      const moduleId: string = frame.file.replace(
        /^(webpack-internal:\/\/\/|file:\/\/)/,
        ''
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
          rootDirectory: rootDir,
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
