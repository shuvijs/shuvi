import WebpackChain from "webpack-chain";
export interface BaseOptions {
    dev: boolean;
    projectRoot: string;
    srcDirs: string[];
    mediaOutputPath: string;
    env?: {
        [x: string]: string;
    };
}
export { WebpackChain };
export declare function baseWebpackChain({ dev, projectRoot, srcDirs, mediaOutputPath, env }: BaseOptions): WebpackChain;
