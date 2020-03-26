import React from "react";
import { File } from "@shuvi/react-fs";
import { useFileByOrder } from "../../hooks/useFileByOrder";

type Module = string | string[];

export interface Props {
  name: string;
  source: string | string[];
  defaultExport?: boolean;
}

function Module({ name, source, defaultExport }: Props) {
  const file = Array.isArray(source)
    ? useFileByOrder(...source)
    : useFileByOrder(source);

  let statements: string[] = [];
  if (defaultExport) {
    statements.push(`import temp from "${file}"`);
    statements.push(`export default temp`);
  } else {
    statements.push(`export * from "${file}"`);
  }

  return <File name={name} content={statements.join("\n")} />;
}

export default React.memo(Module);
