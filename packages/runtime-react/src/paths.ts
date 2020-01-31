import { join, resolve } from "path";

export const resolveRuntime = (relativePath: string, ext = "js") =>
  `${join(__dirname, "runtime", relativePath)}.${ext}`;

  export const resolveTemplate = (relativePath: string, ext = "tpl") =>
  `${join(__dirname, "..", "template", relativePath)}.${ext}`;
