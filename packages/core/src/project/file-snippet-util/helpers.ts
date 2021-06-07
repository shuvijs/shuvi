import { ISpecifier } from '../../types';

export type { ISpecifier };

export const getExportsContent = (
  exports: { [source: string]: ISpecifier | ISpecifier[] },
  stripFullPath: boolean = false
): string => {
  const statements: string[] = [];
  const sources = Object.keys(exports);

  for (let source of sources) {
    const specifiers = ([] as ISpecifier[]).concat(exports[source]);

    // stripFullPath because type definition unable to read full path.
    if (stripFullPath) {
      source = source.substring(source.indexOf('node_modules'));
    }
    for (const specifier of specifiers) {
      if (specifier === '*') {
        statements.push(`export * from "${source}"`);
      } else if (typeof specifier === 'string') {
        statements.push(`export ${specifier} from "${source}"`);
      } else if (specifier.imported === '*') {
        statements.push(`import * as ${specifier.local} from "${source}"`);
        statements.push(`export { ${specifier.local} }`);
      } else {
        statements.push(
          `export { ${specifier.imported} as ${specifier.local} } from "${source}"`
        );
      }
    }
  }

  return statements.join('\n');
};
