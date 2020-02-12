import { loader } from "webpack";
export declare type RouteComponentLoaderOptions = {
    componentAbsolutePath: string;
    active: boolean;
};
declare const routeComponentLoader: loader.Loader;
export default routeComponentLoader;
