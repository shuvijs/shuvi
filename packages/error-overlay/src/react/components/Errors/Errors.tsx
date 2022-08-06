import * as React from 'react';
import { StackFrame } from 'stacktrace-parser';
import { CodeFrame } from '../CodeFrame';
import { ReadyRuntimeError } from '../../helpers/getErrorByType';
import { getFrameSource, OriginalStackFrame } from '../../helpers/stack-frame';

export type ErrorsProps = { error: ReadyRuntimeError };

const CallStackFrame: React.FC<{
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
  }, [hasSource, f]);

  return (
    <div shuvi-call-stack-frame>
      <h6 shuvi-frame-expanded={Boolean(frame.expanded)}>{f.methodName}</h6>
      <div
        data-has-source={hasSource ? 'true' : undefined}
        tabIndex={hasSource ? 10 : undefined}
        role={hasSource ? 'link' : undefined}
        onClick={open}
        title={hasSource ? 'Click to open in your editor' : undefined}
      >
        <span>{getFrameSource(f)}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </div>
    </div>
  );
};

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
            shuvi-data-runtime-error-collapsed-action
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
