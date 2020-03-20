import React from "react";
import { File } from "@shuvi/react-fs";
import { useFileByOrder } from "../../hooks/useFileByOrder";

type Module = string | string[];

export interface IModules {
  [index: string]: Module;
}

export interface Props<T extends IModules = {}> {
  name: string;
  modules?: T;
  defaultExports?: Array<keyof T>;
}

function ModuleCollection<T extends IModules = {}>({
  name,
  modules = {} as any,
  defaultExports = []
}: Props<T>) {
  const keys = Object.keys(modules);
  const statements = keys.map(key => {
    const mod = modules[key];
    const file = Array.isArray(mod)
      ? useFileByOrder(...mod)
      : useFileByOrder(mod);

    if (defaultExports.includes(key)) {
      return `export { default as ${key} } from "${file}"`;
    }

    return [`import * as ${key} from "${file}"`, `export { ${key} }`].join(
      "\n"
    );
  });

  return <File name={name} content={`${statements.join("\n")}`} />;
}

export default React.memo(ModuleCollection);
