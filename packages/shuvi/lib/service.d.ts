import { ApplicationConfig } from "@shuvi/core";
export default class Service {
    private _app;
    private _buildRequier;
    constructor({ config }: {
        config: Partial<ApplicationConfig>;
    });
    start(): Promise<void>;
    private _setupRuntime;
    private get _paths();
    private get _config();
    private _handlePage;
    private _getDocumentTags;
    private _startServer;
}
