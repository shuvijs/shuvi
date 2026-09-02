export { createRoutesFromArray } from './createRoutesFromArray';
export { matchPathname, matchStringify } from './matchPathname';
export {
  matchRoutes,
  IRouteBaseObject,
  rankRouteBranches,
  IMatchRoutesOptions,
  getTrailingSlashRedirectPath
} from './matchRoutes';

export {
  pathToString,
  parseQuery,
  resolvePath,
  joinPaths,
  createLocation
} from './utils';

export * from './types';
export * from './history';
export * from './router';
