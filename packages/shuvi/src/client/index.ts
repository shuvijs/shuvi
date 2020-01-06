/// <reference lib="dom" />

import { bootstrap } from "@shuvi-app/bootstrap";

// type Comp = any;
// const shuvi: ShuviGlobal = (window as any)[CLIENT_GLOBAL_NAME];

bootstrap({ App: () => 'hello' });
