import React from "react";
import { File } from "@shuvi/react-fs";
import { useSelector } from "../models/store";

function Index() {
  const exports = useSelector(state => state.exports);

  const statements: string[] = [];
  const sources = Object.keys(exports);
  for (const source of sources) {
    const specifiers = exports[source];
    if (specifiers === true) {
      statements.push(`export * from "${source}"`);
      continue;
    }

    for (const specifier of specifiers) {
      if (typeof specifier === "string") {
        statements.push(`export { ${specifier} } from "${source}"`);
      } else {
        statements.push(
          `export { ${specifier.imported} as ${specifier.local} } from "${source}"`
        );
      }
    }
  }

  return <File name="index.js" content={statements.join("\n")} />;
}

export default React.memo(Index);
