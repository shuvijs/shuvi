import { join } from "path";

export const resolveSource = (relativePath: string, ext = "js") =>
  `${join(__dirname, relativePath)}.${ext}`;
