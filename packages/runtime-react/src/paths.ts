import { resolve } from "path";

export const resolveDistFile = (...paths: string[]) =>
  `${resolve(__dirname, "..", "lib", ...paths)}`;
