import { Compiler } from "webpack";
interface Options {
    filename: string;
    modules: boolean;
}
export default class BuildManifestPlugin {
    private _options;
    constructor(options?: Partial<Options>);
    apply(compiler: Compiler): void;
}
export {};
