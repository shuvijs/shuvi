import React from "react";
import { File } from "@shuvi/react-fs";
import { useFileByOrder } from "../../hooks/useFileByOrder";

type Module = string | string[];

export interface Props {
  name: string;
  from: string | string[];
}

function Module({ name, from }: Props) {
  const file = Array.isArray(from)
    ? useFileByOrder(...from)
    : useFileByOrder(from);

  return <File name={name} content={`export * from "${file}"`} />;
}

export default React.memo(Module);
