/// <reference types="webpack" />
import { AppCore } from "@shuvi/types/core";
export default class WebpackManager {
    private _app;
    constructor(app: AppCore);
    createWepbackConfig(opts: {
        name: string;
        node: boolean;
    }): import("webpack").Configuration;
}
