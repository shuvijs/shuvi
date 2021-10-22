export { createRoutesFromArray } from './createRoutesFromArray';
export { matchPathname, matchStringify } from './matchPathname';
export {
  matchRoutes,
  IRouteBaseObject,
  rankRouteBranches
} from './matchRoutes';

export {
  pathToString,
  parseQuery,
  resolvePath,
  createLocation,
  createRedirector
} from './utils';

export * from './types';
export * from './history';
export * from './router';
