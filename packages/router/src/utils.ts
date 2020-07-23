export const trimTrailingSlashes = (path: string) => path.replace(/\/+$/, '');
export const normalizeSlashes = (path: string) => path.replace(/\/\/+/g, '/');
export const joinPaths = (paths: string[]) => normalizeSlashes(paths.join('/'));
export const splitPath = (path: string) => normalizeSlashes(path).split('/');
