import React from "react";
import { File } from "@shuvi/react-fs";
import { ISpecifier } from "../../types";

export interface Props {
  name: string;
  exports: { [source: string]: ISpecifier | ISpecifier[] };
}

function Module({ name, exports = {} }: Props) {
  const statements: string[] = [];
  const sources = Object.keys(exports);

  for (const source of sources) {
    const specifiers = ([] as ISpecifier[]).concat(exports[source]);
    for (const specifier of specifiers) {
      if (specifier === '*') {
        statements.push(`export * from "${source}"`);
      } else if (typeof specifier === "string") {
        statements.push(`export { ${specifier} } from "${source}"`);
      } else if (specifier.imported === "*") {
        statements.push(`import * as ${specifier.local} from "${source}"`);
        statements.push(`export { ${specifier.local} }`);
      } else {
        statements.push(
          `export { ${specifier.imported} as ${specifier.local} } from "${source}"`
        );
      }
    }
  }
  return <File name={name} content={`${statements.join("\n")}`} />;
}

export default Module;
