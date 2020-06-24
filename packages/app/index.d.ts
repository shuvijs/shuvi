import { Runtime } from '@shuvi/types';

export declare function getPageData<T = unknown>(key: string, defaultValue?: T): string | T | undefined;

export const App: any;

export const getRuntimeConfig: () => Record<string, string>;

export const router: Runtime.IRouter;
