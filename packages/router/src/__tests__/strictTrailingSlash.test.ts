import { matchRoutes, getTrailingSlashRedirectPath } from '../matchRoutes';
import { createRouter } from '../router';
import { MemoryHistory } from '../history';

const ROUTES = [
  {
    path: '/',
    children: [
      { path: '' },
      { path: 'foo' },
      { path: 'users/:id' },
      { path: 'slash/' }
    ]
  }
];

/**
 * A route tree with a layout below the root, so a branch holds an intermediate
 * route that owns part of the pathname and still has children of its own.
 *
 * `ROUTES` above cannot cover this: its only non-leaf route is `/`, whose match
 * is the single leading slash, so nothing is left for an intermediate route to
 * get wrong.
 */
const NESTED_ROUTES = [
  {
    path: '/',
    children: [
      {
        // static intermediate segment
        path: 'item',
        children: [{ path: '' }, { path: 'detail' }, { path: ':id' }]
      },
      {
        // intermediate segment ending in a param
        path: ':lang',
        children: [{ path: 'login' }]
      }
    ]
  }
];

describe('matchRoutes strict trailing slash', () => {
  it('loose (default): trailing slash still matches non-slash route', () => {
    expect(matchRoutes(ROUTES, '/foo')).not.toBeNull();
    expect(matchRoutes(ROUTES, '/foo/')).not.toBeNull();
    expect(matchRoutes(ROUTES, '/users/123')).not.toBeNull();
    expect(matchRoutes(ROUTES, '/users/123/')).not.toBeNull();
  });

  it('strict: rejects trailing slash on non-slash route', () => {
    expect(matchRoutes(ROUTES, '/foo', '', { strict: true })).not.toBeNull();
    expect(matchRoutes(ROUTES, '/foo/', '', { strict: true })).toBeNull();
    expect(
      matchRoutes(ROUTES, '/users/123', '', { strict: true })
    ).not.toBeNull();
    expect(matchRoutes(ROUTES, '/users/123/', '', { strict: true })).toBeNull();
  });

  it('strict: keeps explicitly slash-suffixed route reachable only with slash', () => {
    expect(matchRoutes(ROUTES, '/slash', '', { strict: true })).toBeNull();
    expect(matchRoutes(ROUTES, '/slash/', '', { strict: true })).not.toBeNull();
  });

  it('strict: index route still matches root', () => {
    expect(matchRoutes(ROUTES, '/', '', { strict: true })).not.toBeNull();
  });
});

describe('matchRoutes strict trailing slash, nested routes', () => {
  const strict = (pathname: string) =>
    matchRoutes(NESTED_ROUTES, pathname, '', { strict: true });

  it('matches a child of a static intermediate route', () => {
    expect(strict('/item/detail')).not.toBeNull();
    expect(strict('/item/42')).not.toBeNull();
  });

  it('matches a child of an intermediate route ending in a param', () => {
    expect(strict('/en/login')).not.toBeNull();
  });

  it('leaves the separator for the child to match', () => {
    // An intermediate route that consumed the separator would report `/item/`
    // here and hand the child `42`, which no child pattern can match.
    const matches = strict('/item/42')!;
    expect(matches.map(match => match.pathname)).toStrictEqual([
      '/',
      '/item',
      '/item/42'
    ]);
    expect(matches[matches.length - 1].params).toStrictEqual({ id: '42' });
  });

  it('agrees with the loose matcher on which route wins', () => {
    const asPaths = (matches: ReturnType<typeof matchRoutes>) =>
      matches && matches.map(match => match.route.path);
    expect(asPaths(strict('/item/42'))).toStrictEqual(
      asPaths(matchRoutes(NESTED_ROUTES, '/item/42'))
    );
    expect(asPaths(strict('/item/detail'))).toStrictEqual(
      asPaths(matchRoutes(NESTED_ROUTES, '/item/detail'))
    );
  });

  it('still rejects the trailing-slash form', () => {
    expect(strict('/item/42/')).toBeNull();
    expect(strict('/item/detail/')).toBeNull();
    expect(strict('/en/login/')).toBeNull();
  });

  it('does not let an intermediate route match a longer segment', () => {
    expect(strict('/items/42')).toBeNull();
  });
});

describe('getTrailingSlashRedirectPath', () => {
  it('returns null for root', () => {
    expect(getTrailingSlashRedirectPath('/')).toBeNull();
    expect(getTrailingSlashRedirectPath('')).toBeNull();
  });

  it('strips a single trailing slash', () => {
    expect(getTrailingSlashRedirectPath('/foo/')).toBe('/foo');
    expect(getTrailingSlashRedirectPath('/users/123/')).toBe('/users/123');
  });

  it('adds slash for non-suffixed path (the slash-suffixed route case)', () => {
    expect(getTrailingSlashRedirectPath('/slash')).toBe('/slash/');
  });
});

describe('createRouter strictTrailingSlash redirect', () => {
  it('does not redirect when strict disabled (loose match)', () => {
    const router = createRouter({
      routes: ROUTES,
      history: new MemoryHistory({ initialEntries: ['/foo/'] }),
      strictTrailingSlash: false
    }).init();
    expect(router.current.matches.length).toBeGreaterThan(0);
    expect(router.current.redirected).toBeFalsy();
  });

  it('redirects /foo/ → /foo (308) when strict enabled', () => {
    const router = createRouter({
      routes: ROUTES,
      history: new MemoryHistory({ initialEntries: ['/foo/'] }),
      strictTrailingSlash: true
    }).init();
    expect(router.current.pathname).toBe('/foo');
    expect(router.current.redirected).toBe(true);
    // status carried in state
    expect((router.current.state as any)?.status).toBe(308);
  });

  it('redirects /slash → /slash/ for a slash-suffixed route', () => {
    const router = createRouter({
      routes: ROUTES,
      history: new MemoryHistory({ initialEntries: ['/slash'] }),
      strictTrailingSlash: true
    }).init();
    expect(router.current.pathname).toBe('/slash/');
    expect(router.current.redirected).toBe(true);
  });

  it('does not redirect when path already canonical', () => {
    const router = createRouter({
      routes: ROUTES,
      history: new MemoryHistory({ initialEntries: ['/foo'] }),
      strictTrailingSlash: true
    }).init();
    expect(router.current.pathname).toBe('/foo');
    expect(router.current.redirected).toBeFalsy();
  });

  it('serves a nested route at its canonical url', () => {
    const router = createRouter({
      routes: NESTED_ROUTES,
      history: new MemoryHistory({ initialEntries: ['/item/42'] }),
      strictTrailingSlash: true
    }).init();
    expect(router.current.matches.length).toBeGreaterThan(0);
    expect(router.current.redirected).toBeFalsy();
  });

  it('redirects /item/42/ → /item/42 (308) for a nested route', () => {
    const router = createRouter({
      routes: NESTED_ROUTES,
      history: new MemoryHistory({ initialEntries: ['/item/42/'] }),
      strictTrailingSlash: true
    }).init();
    expect(router.current.pathname).toBe('/item/42');
    expect(router.current.matches.length).toBeGreaterThan(0);
    expect(router.current.redirected).toBe(true);
    expect((router.current.state as any)?.status).toBe(308);
  });
});
