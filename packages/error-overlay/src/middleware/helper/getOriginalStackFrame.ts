import type { StackFrame } from 'stacktrace-parser';
import * as Rspack from '@shuvi/toolpack/lib/webpack';
import type { Source } from './getSourceById';
import type { OriginalStackFrame } from '../../view/helpers/stack-frame';
import { createOriginalStackFrame } from './createOriginalStackFrame';

export { OriginalStackFrame };

export async function getOriginalStackFrame(
  frame: StackFrame,
  cache: Map<string, Source | null>,
  resolveBuildFile: (...paths: string[]) => string,
  buildDir: string,
  errorMessage?: string,
  compilation?: Rspack.Compilation
): Promise<OriginalStackFrame> {
  /**
   * Handle internal module URLs from both Webpack and Rspack.
   * Rspack uses 'rspack-internal:' prefix, while Webpack uses 'webpack-internal:'.
   */
  if (
    !(
      frame.file?.startsWith('webpack-internal:') ||
      frame.file?.startsWith('rspack-internal:') ||
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
  let frameColumn: number | null = parseInt(frame.column?.toString() ?? '', 10);
  if (!frameColumn) {
    frameColumn = null;
  }

  /**
   * Strip internal URL prefixes to get the actual module path.
   * Both Webpack and Rspack internal URLs are handled uniformly.
   */
  const originalStackFrameResponse = await createOriginalStackFrame({
    line: frameLine,
    column: frameColumn,
    source: cache.get(frame.file),
    frame,
    modulePath: resolveBuildFile(
      buildDir,
      frame.file.replace(
        /^(webpack-internal:\/\/\/|rspack-internal:\/\/\/|file:\/\/)/,
        ''
      )
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
    originalCodeFrame: originalStackFrameResponse.originalCodeFrame || null
  };
}
