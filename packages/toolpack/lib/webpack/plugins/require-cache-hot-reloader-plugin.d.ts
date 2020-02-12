import { Compiler, Plugin } from "webpack";
export default class RequireCacheHotReloader implements Plugin {
    prevAssets: any;
    apply(compiler: Compiler): void;
}
