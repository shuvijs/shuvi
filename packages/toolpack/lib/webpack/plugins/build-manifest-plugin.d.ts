import { Compiler } from "webpack";
export default class BuildManifestPlugin {
    private filename;
    constructor(options: {
        filename: string;
    });
    apply(compiler: Compiler): void;
}
