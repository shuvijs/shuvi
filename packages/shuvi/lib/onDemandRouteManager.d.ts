import { AppCore } from "@shuvi/types/core";
import { RouterService } from "./types/routeService";
import DevServer from "./dev/devServer";
export declare class OnDemandRouteManager {
    private _activedRouteIds;
    private _routesMap;
    private _routes;
    private _app;
    devServer: DevServer | null;
    constructor({ app }: {
        app: AppCore;
    });
    run(routeService: RouterService): void;
    ensureRoutes(pathname: string): Promise<void>;
    activateRoute(routeId: string): Promise<void>;
    _activateRoutes(routeIds: string[]): Promise<void>;
    private _replaceComponentFile;
    private _onRoutesChange;
}
