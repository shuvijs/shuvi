import { resolve } from "path";

export const resolveTemplate = (relativePath: string, ext = "tpl") =>
  `${resolve(__dirname, "..", "..", "template", relativePath)}.${ext}`;
