import * as React from 'react';

import { CodeFrame } from './CodeFrame';
import { CallStackFrame } from './CallStackFrame';
import { ReadyRuntimeError } from '../../helpers/getErrorByType';
import { OriginalStackFrame } from '../../helpers/stack-frame';

export type ErrorsProps = { error: ReadyRuntimeError };

const Errors: React.FC<ErrorsProps> = function Errors({ error }) {
  const firstFirstPartyFrameIndex = React.useMemo<number>(() => {
    return error.frames.findIndex(
      (entry: any) =>
        entry.expanded &&
        Boolean(entry.originalCodeFrame) &&
        Boolean(entry.originalStackFrame)
    );
  }, [error.frames]);

  const firstFrame = React.useMemo<OriginalStackFrame | null>(() => {
    return error.frames[firstFirstPartyFrameIndex] ?? null;
  }, [error.frames, firstFirstPartyFrameIndex]);

  const allLeadingFrames = React.useMemo<OriginalStackFrame[]>(
    () =>
      firstFirstPartyFrameIndex < 0
        ? []
        : error.frames.slice(0, firstFirstPartyFrameIndex),
    [error.frames, firstFirstPartyFrameIndex]
  );

  const [all, setAll] = React.useState(firstFrame == null);
  const toggleAll = React.useCallback(() => {
    setAll(v => !v);
  }, []);

  const leadingFrames = React.useMemo(
    () => allLeadingFrames.filter(f => f.expanded || all),
    [all, allLeadingFrames]
  );
  const allCallStackFrames = React.useMemo<OriginalStackFrame[]>(
    () => error.frames.slice(firstFirstPartyFrameIndex + 1),
    [error.frames, firstFirstPartyFrameIndex]
  );
  const visibleCallStackFrames = React.useMemo<OriginalStackFrame[]>(
    () => allCallStackFrames.filter(f => f.expanded || all),
    [all, allCallStackFrames]
  );

  const canShowMore = React.useMemo<boolean>(() => {
    return (
      allCallStackFrames.length !== visibleCallStackFrames.length ||
      (all && firstFrame != null)
    );
  }, [
    all,
    allCallStackFrames.length,
    firstFrame,
    visibleCallStackFrames.length
  ]);

  return (
    <React.Fragment>
      {firstFrame ? (
        <React.Fragment>
          <h5>Source</h5>
          {leadingFrames.map((frame, index) => (
            <CallStackFrame
              key={`leading-frame-${index}-${all}`}
              frame={frame}
            />
          ))}
          <CodeFrame
            stackFrame={firstFrame.originalStackFrame!}
            codeFrame={firstFrame.originalCodeFrame!}
          />
        </React.Fragment>
      ) : undefined}
      {visibleCallStackFrames.length ? (
        <React.Fragment>
          <h5>Call Stack</h5>
          {visibleCallStackFrames.map((frame, index) => (
            <CallStackFrame key={`call-stack-${index}-${all}`} frame={frame} />
          ))}
        </React.Fragment>
      ) : undefined}
      {canShowMore ? (
        <React.Fragment>
          <button
            tabIndex={10}
            data-runtime-error-collapsed-action
            type="button"
            onClick={toggleAll}
          >
            {all ? 'Hide' : 'Show'} collapsed frames
          </button>
        </React.Fragment>
      ) : undefined}
    </React.Fragment>
  );
};

export { Errors };
