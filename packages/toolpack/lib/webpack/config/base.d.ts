import WebpackChain from "webpack-chain";
export interface BaseOptions {
    dev: boolean;
    projectRoot: string;
    srcDirs: string[];
    mediaFilename: string;
    buildManifestFilename: string;
    publicPath?: string;
    env?: {
        [x: string]: string;
    };
}
export { WebpackChain };
export declare function baseWebpackChain({ dev, projectRoot, srcDirs, mediaFilename, buildManifestFilename, publicPath, env }: BaseOptions): WebpackChain;
