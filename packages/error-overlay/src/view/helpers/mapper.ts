/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { StackFrame } from 'stacktrace-parser';
import { getSourceByFileSource } from './getSourceByFileSource';
import { createOriginalStackFrame } from '../../shared/helper/createOriginalStackFrame';

/**
 * Enhances a set of <code>StackFrame</code>s with their original positions and code (when available).
 * @param {StackFrame[]} frames A set of <code>StackFrame</code>s which contain (generated) code positions.
 */
export async function mapper(frames: StackFrame[], errorMessage: string) {
  const cache: any = {};
  const files: string[] = [];
  frames.forEach(frame => {
    const { file } = frame;
    if (file == null) {
      return;
    }
    if (files.indexOf(file) !== -1) {
      return;
    }
    files.push(file);
  });
  await Promise.all(
    files.map(async fileName => {
      const fileSource = await fetch(fileName).then(r => r.text());
      const source = await getSourceByFileSource(fileName, fileSource);
      cache[fileName] = { source };
    })
  );

  return Promise.all(
    frames.map(async frame => {
      const { file, lineNumber, column: columnNumber } = frame;
      let { source } = cache[file!] || {};

      if (source == null || lineNumber == null) {
        return {
          error: true,
          reason: 'Unknown Error',
          external: false,
          expanded: false,
          sourceStackFrame: frame,
          originalStackFrame: null,
          originalCodeFrame: null
        };
      }

      const originalStackFrameResponse = await createOriginalStackFrame({
        line: lineNumber,
        column: columnNumber,
        source,
        frame,
        errorMessage
      });

      return {
        error: false,
        reason: null,
        external: false,
        expanded: !Boolean(
          (frame.file?.includes('node_modules') ||
            originalStackFrameResponse!.originalStackFrame?.file?.includes(
              'node_modules'
            )) ??
            true
        ),
        sourceStackFrame: frame,
        originalStackFrame: originalStackFrameResponse!.originalStackFrame,
        originalCodeFrame: originalStackFrameResponse!.originalCodeFrame || null
      };
    })
  );
}
