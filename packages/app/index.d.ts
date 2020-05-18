import { Runtime } from '@shuvi/types';

export const App: any;

export const getRuntimeConfig: () => Record<string, string>;

export const router: Runtime.IRouter;

export const telestore: Runtime.IServerContext;
