import { parse, StackFrame } from 'stacktrace-parser';

const regexStatic = /\/static\/.+/;
const regexValidFrame_Chrome = /^\s*(at|in)\s.+(:\d+)/;
const regexValidFrame_FireFox =
  /(^|@)\S+:\d+|.+line\s+\d+\s+>\s+(eval|Function).+/;

export function parseError(stack: string): string {
  if (typeof stack === 'string') {
    return stack
      .split('\n')
      .filter(
        e => regexValidFrame_Chrome.test(e) || regexValidFrame_FireFox.test(e)
      )
      .join('\n');
  }
  return '';
}

export function parseStack(stack: string): StackFrame[] {
  const frames = parse(parseError(stack));
  return frames.map(frame => {
    try {
      const url = new URL(frame.file!);
      const res = regexStatic.exec(url.pathname);
      if (res) {
        frame.file = 'file://' + res.pop()!;
      }
    } catch {}
    return frame;
  });
}
