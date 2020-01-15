import { MultiCompiler, Compiler } from "webpack";
import Express from "express";
interface Config {
    host: string;
    port: number;
    publicPath: string;
}
export default class Server {
    private _compiler;
    private _app;
    private _config;
    private _webpackHotMiddleware;
    private _middlewares;
    constructor(compiler: MultiCompiler, config: Config);
    send(action: string, payload?: any): void;
    start(): void;
    watchCompiler(compiler: Compiler, { useTypeScript, log, onFirstSuccess }: {
        useTypeScript: boolean;
        log: (...args: any[]) => void;
        onFirstSuccess?: () => void;
    }): void;
    use(handle: Express.RequestHandler): Express.Application;
}
export {};
