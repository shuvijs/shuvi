export const getExportsContent = (
  exports: { [source: string]: string | string[] },
  stripFullPath: boolean = false
): string => {
  const statements: string[] = [];
  const sources = Object.keys(exports);

  for (let source of sources) {
    const exportContents = ([] as string[]).concat(exports[source]);

    // stripFullPath because type definition unable to read full path.
    if (stripFullPath) {
      source = source.substring(source.indexOf('node_modules'));
    }
    for (const exportContent of exportContents) {
      statements.push(`export ${exportContent} from "${source}"`);
    }
  }

  return statements.join('\n');
};
