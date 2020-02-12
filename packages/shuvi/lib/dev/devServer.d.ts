import { MultiCompiler, Compiler } from "webpack";
import Express from "express";
interface Config {
    host: string;
    port: number;
    publicPath: string;
}
export default class Server {
    private _app;
    private _config;
    private _webpackDevMiddleware;
    private _webpackHotMiddleware;
    private _beforeMiddlewares;
    private _afterMiddlewares;
    constructor(compiler: MultiCompiler, config: Config);
    send(action: string, payload?: any): void;
    start(): void;
    watchCompiler(compiler: Compiler, { useTypeScript, log, onFirstSuccess }: {
        useTypeScript: boolean;
        log: (...args: any[]) => void;
        onFirstSuccess?: () => void;
    }): void;
    invalidate(): void;
    waitUntilValid(force?: boolean): Promise<unknown>;
    before(handle: Express.RequestHandler): Express.Application;
    use(handle: Express.RequestHandler): Express.Application;
}
export {};
