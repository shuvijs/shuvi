/**
 * Recursively read directory
 * @param {string} dir Directory to read
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the name part is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the name part is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @param {string} options.arr This doesn't have to be provided, it's used for the recursion
 * @returns {Promise<string[]>} Promise array holding all relative paths
 */
export declare function recursiveReadDir(dir: string, { filter, ignore, rootDir, arr }?: {
    filter?: RegExp;
    ignore?: RegExp;
    rootDir?: string;
    arr?: string[];
}): Promise<string[]>;
/**
 * Recursively read directory
 * @param {string} dir Directory to read
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the name part is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the name part is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @param {string} options.arr This doesn't have to be provided, it's used for the recursion
 * @returns {string[]} Promise array holding all relative paths
 */
export declare function recursiveReadDirSync(dir: string, { filter, ignore, rootDir, arr }?: {
    filter?: RegExp;
    ignore?: RegExp;
    rootDir?: string;
    arr?: string[];
}): string[];
