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
    expect(
      matchRoutes(ROUTES, '/users/123/', '', { strict: true })
    ).toBeNull();
  });

  it('strict: keeps explicitly slash-suffixed route reachable only with slash', () => {
    expect(matchRoutes(ROUTES, '/slash', '', { strict: true })).toBeNull();
    expect(matchRoutes(ROUTES, '/slash/', '', { strict: true })).not.toBeNull();
  });

  it('strict: index route still matches root', () => {
    expect(matchRoutes(ROUTES, '/', '', { strict: true })).not.toBeNull();
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
});
