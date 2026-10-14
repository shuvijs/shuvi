import * as pathTokenizer from '../pathTokenizer';
import * as pathParserRanker from '../pathParserRanker';
import { compilePath, tokensToParser } from '../pathParserRanker';
import { tokenizePath } from '../pathTokenizer';
import { matchPathname, matchStringify } from '../matchPathname';
import { matchRoutes, rankRouteBranches } from '../matchRoutes';
import { createRouter } from '../router';
import { MemoryHistory } from '../history';

describe('compilePath', () => {
  it('should reuse the parser for the same path and options', () => {
    const parser = compilePath('/compile-path/:id');
    expect(compilePath('/compile-path/:id')).toBe(parser);
    expect(
      compilePath('/compile-path/:id', {
        end: true,
        strict: false,
        sensitive: false
      })
    ).toBe(parser);
  });

  it('should compile a parser per option combination', () => {
    const parser = compilePath('/compile-path/options');
    expect(compilePath('/compile-path/options', { end: false })).not.toBe(
      parser
    );
    expect(compilePath('/compile-path/options', { strict: true })).not.toBe(
      parser
    );
    expect(compilePath('/compile-path/options', { sensitive: true })).not.toBe(
      parser
    );
  });

  // tokensToParser mutates the tokens it is given for a catch-all path, so the
  // tokens must never be shared between parsers built with different options.
  it('should compile a catch-all path correctly whatever was compiled first', () => {
    const path = '/compile-path-catch-all/*';
    const fresh = (options: pathParserRanker.PathParserOptions) =>
      tokensToParser(tokenizePath(path), options).re.source;

    expect(compilePath(path, { strict: false }).re.source).toBe(
      fresh({ strict: false })
    );
    expect(compilePath(path, { strict: true }).re.source).toBe(
      fresh({ strict: true })
    );
    expect(
      matchPathname({ path, strict: true }, '/compile-path-catch-all/a/')
    ).toBeNull();
    expect(
      matchPathname({ path, strict: false }, '/compile-path-catch-all/a/')
    ).not.toBeNull();
  });

  it('should not cache a path that fails to compile', () => {
    const path = '/compile-path-invalid/:id([)';
    expect(() => compilePath(path)).toThrow(/Invalid custom RegExp/);
    expect(() => compilePath(path)).toThrow(/Invalid custom RegExp/);
  });
});

describe('path parser caching', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('matchPathname and matchStringify should tokenize a path only once', () => {
    const spy = jest.spyOn(pathTokenizer, 'tokenizePath');
    const path = '/cached-match-pathname/:id';
    expect(matchPathname(path, '/cached-match-pathname/1')!.params).toEqual({
      id: '1'
    });
    expect(matchPathname(path, '/cached-match-pathname/2')!.params).toEqual({
      id: '2'
    });
    expect(matchStringify(path, { id: '3' })).toBe('/cached-match-pathname/3');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('matchPathname should return fresh params for every call', () => {
    const path = '/cached-fresh-params/:id';
    const first = matchPathname(path, '/cached-fresh-params/1')!;
    const second = matchPathname(path, '/cached-fresh-params/2')!;
    expect(first.params).toEqual({ id: '1' });
    expect(second.params).toEqual({ id: '2' });
    expect(first.params).not.toBe(second.params);
  });

  it('rankRouteBranches should not change the cached score of a path', () => {
    const path = '/cached-rank';
    const score = JSON.stringify(compilePath(path).score);
    // the last route has an empty path, which adds a bonus to the branch score
    rankRouteBranches([
      [path, [{ path: '/cached-rank' }, { path: '' }]],
      [path, [{ path: '/cached-rank' }]]
    ]);
    expect(JSON.stringify(compilePath(path).score)).toBe(score);
  });

  it('matchRoutes should not tokenize again for the same routes', () => {
    const routes = [
      {
        path: '/cached-match-routes',
        children: [{ path: '' }, { path: ':id' }, { path: '*' }]
      },
      { path: '/cached-match-routes-other/:id' }
    ];
    const first = matchRoutes(routes, '/cached-match-routes/1');
    const spy = jest.spyOn(pathTokenizer, 'tokenizePath');
    expect(matchRoutes(routes, '/cached-match-routes/1')).toEqual(first);
    matchRoutes(routes, '/cached-match-routes-other/2');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('router matcher', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not rank the routes again on every match', () => {
    const router = createRouter({
      routes: [
        { path: '/router-matcher-a' },
        { path: '/router-matcher-b/:id' }
      ],
      history: new MemoryHistory()
    });
    expect(router.match('/router-matcher-b/1')[0].params).toEqual({ id: '1' });
    const spy = jest.spyOn(pathParserRanker, 'comparePathParserScore');
    expect(router.match('/router-matcher-b/2')[0].params).toEqual({ id: '2' });
    expect(router.match('/router-matcher-a')[0].route.path).toBe(
      '/router-matcher-a'
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('should match against the new routes after replaceRoutes', () => {
    const router = createRouter({
      routes: [{ path: '/router-matcher-old' }],
      history: new MemoryHistory()
    });
    expect(router.match('/router-matcher-old')).toHaveLength(1);
    router.replaceRoutes([{ path: '/router-matcher-new' }]);
    expect(router.match('/router-matcher-old')).toHaveLength(0);
    expect(router.match('/router-matcher-new')).toHaveLength(1);
  });
});

describe('router matcher in development', () => {
  const env = process.env.NODE_ENV;
  let createDevRouter: typeof createRouter;

  beforeAll(() => {
    (process.env as any).NODE_ENV = 'development';
    jest.isolateModules(() => {
      createDevRouter = require('../router').createRouter;
    });
  });

  afterAll(() => {
    (process.env as any).NODE_ENV = env;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setup = () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const router = createDevRouter({
      routes: [
        { path: '/dev-a', children: [{ path: 'child' }] },
        { path: '/dev-b' }
      ],
      history: new MemoryHistory()
    });
    return { warn, router };
  };

  it.each([
    ['adding a route', (routes: any[]) => routes.push({ path: '/dev-c' })],
    ['replacing a route', (routes: any[]) => (routes[1] = { path: '/dev-c' })],
    ['changing a path', (routes: any[]) => (routes[1].path = '/dev-c')],
    [
      'changing caseSensitive',
      (routes: any[]) => (routes[1].caseSensitive = true)
    ],
    [
      'changing children',
      (routes: any[]) => (routes[0].children = [{ path: 'other' }])
    ],
    [
      'changing a nested route',
      (routes: any[]) => routes[0].children.push({ path: 'other' })
    ]
  ])('should warn once on %s in place after matching', (_, mutate) => {
    const { warn, router } = setup();
    router.match('/dev-a/child');
    mutate(router.routes);
    router.match('/dev-a/child');
    router.match('/dev-a/child');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/router\.replaceRoutes/);
  });

  it('should not warn on changes matching does not read', () => {
    const { warn, router } = setup();
    router.match('/dev-a/child');
    (router.routes[0] as any).component = 'component';
    router.match('/dev-a/child');
    expect(warn).not.toHaveBeenCalled();
  });

  it('should not warn on changes before the first match', () => {
    const { warn, router } = setup();
    router.routes.push({ path: '/dev-c' });
    expect(router.match('/dev-c')).toHaveLength(1);
    router.match('/dev-c');
    expect(warn).not.toHaveBeenCalled();
  });

  it('should not warn after replaceRoutes', () => {
    const { warn, router } = setup();
    router.match('/dev-a/child');
    router.replaceRoutes([{ path: '/dev-c' }]);
    expect(router.match('/dev-c')).toHaveLength(1);
    router.match('/dev-c');
    expect(warn).not.toHaveBeenCalled();
  });
});
