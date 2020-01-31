export interface RouteConfig {
    path?: string | string[];
    exact?: boolean;
    routes?: RouteConfig[];
    component?: any;
    [x: string]: any;
}
export interface MatchedRoute<Params extends {
    [K in keyof Params]?: string;
}> {
    route: RouteConfig;
    match: {
        params: Params;
        isExact: boolean;
        path: string;
        url: string;
    };
}
export interface RouteMatch {
    route: RouteConfig;
    match: {
        url: string;
        isExact: boolean;
    };
}
export interface RouterService {
    getRoutes(): Promise<RouteConfig[]> | RouteConfig[];
}
