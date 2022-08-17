import { StackFrame } from 'stacktrace-parser';
import { DEV_ORIGINAL_STACK_FRAME_ENDPOINT } from '@shuvi/shared/esm/constants';

type OriginalStackFrameResponse = {
  originalStackFrame: StackFrame;
  originalCodeFrame: string | null;
};
export type OriginalStackFrame = {
  error: boolean;
  reason: string | null;
  external: boolean;
  expanded: boolean;
  sourceStackFrame: StackFrame;
  originalStackFrame: StackFrame | null;
  originalCodeFrame: string | null;
};

export function getOriginalStackFrames(
  frames: StackFrame[],
  type: 'server' | null,
  errorMessage: string
) {
  return Promise.all(
    frames.map(frame => getOriginalStackFrame(frame, type, errorMessage))
  );
}

export function getOriginalStackFrame(
  source: StackFrame,
  type: 'server' | null,
  errorMessage: string
): Promise<OriginalStackFrame> {
  async function _getOriginalStackFrame(): Promise<OriginalStackFrame> {
    const params = new URLSearchParams();
    params.append('isServer', String(type === 'server'));
    params.append('errorMessage', errorMessage);
    for (const key in source) {
      params.append(key, ((source as any)[key] ?? '').toString());
    }

    const controller = new AbortController();
    const tm = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `${DEV_ORIGINAL_STACK_FRAME_ENDPOINT}?${params.toString()}`,
      {
        signal: controller.signal
      }
    ).finally(() => {
      clearTimeout(tm);
    });
    if (!res.ok || res.status === 204) {
      return Promise.reject(new Error(await res.text()));
    }

    const body: OriginalStackFrameResponse = await res.json();
    return {
      error: false,
      reason: null,
      external: false,
      expanded: !Boolean(
        /* collapsed */
        (source.file?.includes('node_modules') ||
          body.originalStackFrame?.file?.includes('node_modules')) ??
          true
      ),
      sourceStackFrame: source,
      originalStackFrame: body.originalStackFrame,
      originalCodeFrame: body.originalCodeFrame || null
    };
  }

  if (!source.file?.startsWith('file:')) {
    return Promise.resolve({
      error: false,
      reason: null,
      external: true,
      expanded: false,
      sourceStackFrame: source,
      originalStackFrame: null,
      originalCodeFrame: null
    });
  }

  return _getOriginalStackFrame().catch((err: Error) => ({
    error: true,
    reason: err?.message ?? err?.toString() ?? 'Unknown Error',
    external: false,
    expanded: false,
    sourceStackFrame: source,
    originalStackFrame: null,
    originalCodeFrame: null
  }));
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
