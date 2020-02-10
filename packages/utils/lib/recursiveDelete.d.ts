/**
 * Recursively read directory
 * @param {string} dir Directory to delete
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the relative file path is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the relative file path is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 */
export declare function recursiveDelete(dir: string, { filter, ignore, rootDir }?: {
    filter?: RegExp;
    ignore?: RegExp;
    rootDir?: string;
}): Promise<void>;
