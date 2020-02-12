import { RouteConfig } from "@shuvi/types/core";
import { RouterService, SubscribeFn } from "./types/routeService";
export default class RouterServiceImpl implements RouterService {
    private _pagesDir;
    private _unwatch;
    private _event;
    constructor(pagesDir: string);
    getRoutes(): Promise<RouteConfig[]>;
    subscribe(listener: SubscribeFn): void;
    private _getRoutes;
    private _createWatcher;
}
