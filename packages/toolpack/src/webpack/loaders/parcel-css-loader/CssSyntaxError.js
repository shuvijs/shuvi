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

    this.message += `\n${source}\n`;

    // We don't need stack https://github.com/postcss/postcss/blob/master/docs/guidelines/runner.md#31-dont-show-js-stack-for-csssyntaxerror
    this.stack = false;
  }
}
