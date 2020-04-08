import { resolve } from "path";

export const resolveDist = (...paths: string[]) =>
  `${resolve(__dirname, "..", "es", ...paths)}`;

export const resolveDep = (module: string) => require.resolve(module);
