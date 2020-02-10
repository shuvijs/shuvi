import { AppConfig } from "@shuvi/types/core";
export default class Service {
    private _app;
    private _buildRequier;
    private _routerService;
    constructor({ config }: {
        config: Partial<AppConfig>;
    });
    start(): Promise<void>;
    private _setupApp;
    private get _paths();
    private get _config();
    private _handlePage;
    private _renderPage;
    private _getDocumentProps;
    private _getDocumentInlineAppData;
    private _getDocumentContent;
    private _startServer;
}
