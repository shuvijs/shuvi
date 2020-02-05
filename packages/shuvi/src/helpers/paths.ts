import { resolve } from "path";

export const resolvePackageFile = (...paths: string[]) =>
  `${resolve(__dirname, "..", "..", ...paths)}`;

export const resolveTemplate = (relativePath: string, ext = "tpl") =>
  resolvePackageFile("template", `${relativePath}.${ext}`);
