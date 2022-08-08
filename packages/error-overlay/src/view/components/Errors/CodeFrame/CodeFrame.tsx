import Anser from 'anser';
import * as React from 'react';
import { StackFrame } from 'stacktrace-parser';
import stripAnsi from 'strip-ansi';

import { ExternalLinkIcon } from '../../Icons';
import { getFrameSource } from '../../../helpers/stack-frame';

export type CodeFrameProps = { stackFrame: StackFrame; codeFrame: string };

export const CodeFrame: React.FC<CodeFrameProps> = function CodeFrame({
  stackFrame,
  codeFrame
}) {
  // Strip leading spaces out of the code frame:
  const formattedFrame = React.useMemo<string>(() => {
    const lines = codeFrame.split(/\r?\n/g);
    const prefixLength = lines
      .map(line => /^>? +\d+ +\| ( *)/.exec(stripAnsi(line)))
      .filter(Boolean)
      .map(v => v!.pop()!)
      .reduce((c, n) => (isNaN(c) ? n.length : Math.min(c, n.length)), NaN);

    if (prefixLength > 1) {
      const p = ' '.repeat(prefixLength);
      return lines
        .map((line, a) =>
          ~(a = line.indexOf('|'))
            ? line.substring(0, a) + line.substring(a).replace(p, '')
            : line
        )
        .join('\n');
    }
    return lines.join('\n');
  }, [codeFrame]);

  const decoded = React.useMemo(() => {
    return Anser.ansiToJson(formattedFrame, {
      json: true,
      use_classes: true,
      remove_empty: true
    });
  }, [formattedFrame]);

  const open = React.useCallback(() => {
    const params = new URLSearchParams();
    for (const key in stackFrame) {
      params.append(key, ((stackFrame as any)[key] ?? '').toString());
    }
  }, [stackFrame]);

  return (
    <div data-codeframe>
      <div>
        <p
          role="link"
          onClick={open}
          tabIndex={1}
          title="Click to open in your editor"
        >
          <span>
            {getFrameSource(stackFrame)} @ {stackFrame.methodName}
          </span>
          <ExternalLinkIcon />
        </p>
      </div>
      <pre>
        {decoded.map((entry, index) => (
          <span
            key={`frame-${index}`}
            style={{
              color: entry.fg ? `var(--color-${entry.fg})` : undefined,
              ...(entry.decoration === 'bold'
                ? { fontWeight: 800 }
                : entry.decoration === 'italic'
                ? { fontStyle: 'italic' }
                : undefined)
            }}
          >
            {entry.content}
          </span>
        ))}
      </pre>
    </div>
  );
};
