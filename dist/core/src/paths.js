"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const constants_1 = require("@shuvi/shared/lib/constants");
function getPaths(opts) {
    const { cwd, outputPath } = opts;
    const env = process.env.NODE_ENV;
    const toAbsolute = (p) => path_1.join(cwd, p);
    const buildDir = toAbsolute(outputPath || "./build");
    const pagesDir = toAbsolute("src/pages");
    return {
        projectDir: cwd,
        buildDir,
        // nodeModulesDir: toAbsolute("node_modules"),
        srcDir: toAbsolute("src"),
        appDir: toAbsolute(`.${constants_1.NAME}/${env}/app`),
        pagesDir
        // pageDocument: join(pagesDir, "document")
        // tmpDir: tmpDirPath
    };
}
exports.getPaths = getPaths;
