/// <reference lib="dom" />
import { bootstrap } from "@shuvi-app/bootstrap";
import initWebpackHMR from "./dev/webpackHotDevClient";
// type Comp = any;
// const shuvi: ShuviGlobal = (window as any)[CLIENT_GLOBAL_NAME];

initWebpackHMR();
bootstrap({ App: () => "hello" });
