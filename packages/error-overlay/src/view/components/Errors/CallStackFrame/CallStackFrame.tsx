import * as React from 'react';
import { StackFrame } from 'stacktrace-parser';

import { ExternalLinkIcon } from '../../Icons';
import {
  getFrameSource,
  OriginalStackFrame
} from '../../../helpers/stack-frame';

export type CallStackFrameProps = { stackFrame: StackFrame; codeFrame: string };

export const CallStackFrame: React.FC<{
  frame: OriginalStackFrame;
}> = function CallStackFrame({ frame }) {
  const f: StackFrame = frame.originalStackFrame ?? frame.sourceStackFrame;
  const hasSource = Boolean(frame.originalCodeFrame);

  const open = React.useCallback(() => {
    if (!hasSource) return;

    const params = new URLSearchParams();
    for (const key in f) {
      params.append(key, ((f as any)[key] ?? '').toString());
    }

    //TODO: how to handle launch editor from middleware
  }, [hasSource, f]);

  return (
    <div data-call-stack-frame>
      <h6 data-frame-expanded={Boolean(frame.expanded)}>{f.methodName}</h6>
      <div
        data-has-source={hasSource ? 'true' : undefined}
        tabIndex={hasSource ? 10 : undefined}
        role={hasSource ? 'link' : undefined}
        onClick={open}
        title={hasSource ? 'Click to open in your editor' : undefined}
      >
        <span>{getFrameSource(f)}</span>
        <ExternalLinkIcon />
      </div>
    </div>
  );
};
