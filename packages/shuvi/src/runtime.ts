import path from "path";
import { Runtime } from "@shuvi/types";
import ReactRuntime from "@shuvi/runtime-react";

const runtimeDir = path.dirname(
  require.resolve("@shuvi/runtime-react/package.json")
);
const runtime: Runtime.IRuntime = ReactRuntime;

export { runtime, runtimeDir };
