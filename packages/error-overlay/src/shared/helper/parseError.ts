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
