/// <reference lib="dom" />

import { bootstrap } from "@shuvi-app/bootstrap";
import { CLIENT_GLOBAL_NAME } from "../constants";

type Comp = any;

interface ShuviGlobal {
  appComponent: Comp;
}

const shuvi: ShuviGlobal = (window as any)[CLIENT_GLOBAL_NAME];

bootstrap({ App: shuvi.appComponent });
