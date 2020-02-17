import { AppConfig } from "@shuvi/types/core";
export default class Service {
    private _app;
    private _webpackDistModuleLoader;
    private _routerService;
    private _onDemandRouteMgr;
    private _devServer;
    constructor({ config }: {
        config: Partial<AppConfig>;
    });
    start(): Promise<void>;
    private _setupApp;
    private get _paths();
    private get _config();
    private _onDemandRouteMiddleware;
    private _pageMiddleware;
    private _renderPage;
    private _getDocumentProps;
    private _getDocumentInlineAppData;
    private _getDocumentContent;
}
