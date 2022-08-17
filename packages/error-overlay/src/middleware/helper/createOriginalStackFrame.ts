import { codeFrameColumns } from '@babel/code-frame';
import { StackFrame } from 'stacktrace-parser';

import type webpack from '@shuvi/toolpack/lib/webpack';

import { getSourcePath } from './getSourcePath';
import { getModuleById } from './getModuleById';
import { findOriginalSourcePositionAndContent } from './findOriginalSourcePositionAndContent';

export type OriginalStackFrameResponse = {
  originalStackFrame: StackFrame;
  originalCodeFrame: string | null;
};

export async function createOriginalStackFrame({
  line,
  column,
  source,
  modulePath,
  frame,
  errorMessage,
  compilation
}: {
  line: number;
  column: number | null;
  source: any;
  modulePath?: string;
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

  const filePath = getSourcePath(sourcePosition.source) || modulePath || '';

  const originalFrame: StackFrame = {
    file: sourceContent ? filePath : sourcePosition.source,
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
