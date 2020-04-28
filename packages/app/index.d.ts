import { Runtime, IRuntimeConfig } from '@shuvi/types';

export const App: any;

export const getRuntimeConfig: () => Record<string, string>;

export function setRuntimeConfig(config: IRuntimeConfig): void;

export const router: Runtime.IRouter;

export const telestore: Runtime.IServerContext;
