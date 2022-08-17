export function getSourceMapUrl(fileContents: string): string {
  const regex = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/gm;
  let match = null;
  for (;;) {
    let next = regex.exec(fileContents);
    if (next == null) {
      break;
    }
    match = next;
  }
  if (!(match && match[1])) {
    return 'Cannot find a source map';
  }
  return match[1].toString();
}
