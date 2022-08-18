import { StackFrame } from 'stacktrace-parser';
import { DEV_ORIGINAL_STACK_FRAME_ENDPOINT } from '@shuvi/shared/esm/constants';

export type OriginalStackFrame = {
  error: boolean;
  reason: string | null;
  external: boolean;
  expanded: boolean;
  sourceStackFrame: StackFrame;
  originalStackFrame: StackFrame | null;
  originalCodeFrame: string | null;
};

export async function getOriginalStackFrames(
  frames: StackFrame[],
  type: 'server' | null,
  errorMessage: string
): Promise<OriginalStackFrame[]> {
  const params = new URLSearchParams();
  params.append('isServer', String(type === 'server'));
  params.append('errorMessage', errorMessage);
  params.append('frames', JSON.stringify(frames));

  const res = await fetch(
    `${DEV_ORIGINAL_STACK_FRAME_ENDPOINT}?${params.toString()}`
  );

  return await res.json();
}

export function getFrameSource(frame: StackFrame): string {
  let str = '';
  try {
    const u = new URL(frame.file!);

    // Strip the origin for same-origin scripts.
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.location?.origin !== u.origin
    ) {
      // URLs can be valid without an `origin`, so long as they have a
      // `protocol`. However, `origin` is preferred.
      if (u.origin === 'null') {
        str += u.protocol;
      } else {
        str += u.origin;
      }
    }

    // Strip query string information as it's typically too verbose to be
    // meaningful.
    str += u.pathname;
    str += ' ';
  } catch {
    str += (frame.file || '(unknown)') + ' ';
  }

  if (frame.lineNumber != null) {
    if (frame.column != null) {
      str += `(${frame.lineNumber}:${frame.column}) `;
    } else {
      str += `(${frame.lineNumber}) `;
    }
  }
  return str.slice(0, -1);
}
