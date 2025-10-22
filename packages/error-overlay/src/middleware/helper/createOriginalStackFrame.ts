import { codeFrameColumns } from '@babel/code-frame';
import { StackFrame } from 'stacktrace-parser';

import * as Rspack from '@shuvi/toolpack/lib/webpack';

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
  compilation?: Rspack.Compilation;
}): Promise<OriginalStackFrameResponse | null> {
  const match = errorMessage?.match(/'([^']+)' module/);
  const moduleNotFound = match && match[1];

  /**
   * Handle module not found errors by attempting to get import location.
   * Falls back to normal source mapping if buildInfo API is not available or if no module error.
   */
  let result = null;

  if (moduleNotFound && compilation) {
    try {
      // Try to use buildInfo.importLocByPath if available (Webpack compatibility)
      const module = getModuleById(modulePath, compilation);
      result = module?.buildInfo?.importLocByPath?.get(moduleNotFound) ?? null;
    } catch (e) {
      // Rspack may not support this API, fall back to source mapping
      result = null;
    }
  }

  // If no module error or buildInfo lookup failed, use source mapping
  if (!result) {
    result = await findOriginalSourcePositionAndContent(source, {
      line,
      column
    });
  }

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
