import { RouteConfig } from "@shuvi/types/core";
import { RouterService } from "./types/routeService";
declare type OnChangeListener = (v: RouteConfig[]) => void;
export default class RouterServiceImpl implements RouterService {
    private _pagesDir;
    private _unwatch;
    private _event;
    constructor(pagesDir: string);
    getRoutes(): Promise<RouteConfig[]>;
    onChange(listener: OnChangeListener): void;
    private _getRoutes;
    private _createWatcher;
}
export {};
