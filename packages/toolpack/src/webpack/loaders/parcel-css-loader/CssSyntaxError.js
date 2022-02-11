function showSourceCode(source, lineNo, columnNo) {
  if (!source) return '';

  let lines = source.split(/\r?\n/);
  let start = Math.max(lineNo - 3, 0);
  let end = Math.min(lineNo + 2, lines.length);

  let maxWidth = String(end).length;

  return lines
    .slice(start, end)
    .map((line, index) => {
      let number = start + 1 + index;
      let gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | ';
      if (number === lineNo) {
        let spacing =
          gutter.replace(/\d/g, ' ') +
          line.slice(0, columnNo - 1).replace(/[^\t]/g, ' ');
        return '>' + gutter + line + '\n ' + spacing + '^';
      }
      return ' ' + gutter + line;
    })
    .join('\n');
}

export default class CssSyntaxError extends Error {
  constructor(error) {
    super(error);

    const { source, fileName, loc } = error;
    const { line, column } = loc;

    this.message = `\n\n${this.message}\n\n`;

    this.message += `${fileName || `<css input>`}`;

    if (typeof line !== 'undefined') {
      this.message += `(${line}:${column}) \n`;
    }

    this.message += `\n${showSourceCode(source, line, column)}\n`;

    // We don't need stack https://github.com/postcss/postcss/blob/master/docs/guidelines/runner.md#31-dont-show-js-stack-for-csssyntaxerror
    this.stack = false;
  }
}
