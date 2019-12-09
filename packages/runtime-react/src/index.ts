import { join } from "path";

const resolveSource = (relativePath: string, ext = "js") =>
  `${join(__dirname, "source", relativePath)}.${ext}`;

export const Source = {
  document: resolveSource("document"),
  main: resolveSource("main")
};
