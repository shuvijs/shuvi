import { Runtime } from "@shuvi/types";
import { IRuntimeConfig } from "@shuvi/types";

export const App: any;

export const getRuntimeConfig: () => Record<string, string>;

export function setRuntimeConfig(config: IRuntimeConfig): void;

export const router: Runtime.IRouter;
