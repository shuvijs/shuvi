import isEqual from '@shuvi/utils/lib/isEqual';
import { IRoute, IPageRouteRecord, IRouteMatch } from '../routerTypes';
import { Loader } from '../loader';

type PreloadFn = () => Promise<void>;

export async function runPreload(to: IRoute<IPageRouteRecord>): Promise<void> {
  const toMatches: IRouteMatch<IPageRouteRecord>[] = to.matches;
  const preloadList: PreloadFn[] = [];
  toMatches.forEach(match => {
    const preload = match.route.component?.preload;
    if (preload && typeof preload === 'function') {
      preloadList.push(preload());
    }
  });

  await Promise.all(preloadList);
}

export function getRouteMatchesWithInvalidLoader(
  to: IRoute<IPageRouteRecord>,
  from: IRoute<IPageRouteRecord>,
  loaders: Record<string, Loader>
): IRouteMatch<IPageRouteRecord>[] {
  const toMatches: IRouteMatch<IPageRouteRecord>[] = to.matches;
  const fromMatches: (IRouteMatch<IPageRouteRecord> | undefined)[] =
    from.matches;
  let changedMatches: IRouteMatch<IPageRouteRecord>[] = [];

  /**
   * When a navigation is triggered, loaders should run in the following situation:
   * 1. If a route changed (new route or same dynamic route but different params), its loader and all its children's loaders should run.
   * 2. Last nested route's loader should always run.
   */

  for (let i = 0; i < toMatches.length; i++) {
    const currentToMatch = toMatches[i];
    const currentFromMatch = fromMatches[i];
    // new route
    if (currentToMatch.route.id !== currentFromMatch?.route.id) {
      changedMatches.push(...toMatches.slice(i));
      break;
      // same route but different params
    } else if (!isEqual(currentToMatch.params, currentFromMatch?.params)) {
      changedMatches.push(...toMatches.slice(i));
      break;
    }
    // last nested route (last match)
    if (i === toMatches.length - 1) {
      changedMatches.push(currentToMatch);
    }
  }

  const targets: IRouteMatch<IPageRouteRecord>[] = [];
  changedMatches.forEach(match => {
    const id: string = match.route.id;
    if (loaders[id] && typeof loaders[id] === 'function') {
      targets.push(match);
    }
  });

  return targets;
}
