import { resolveFixture, sortByPath } from './utils';
import { Route } from '../route';

describe('route', () => {
  test('should work', async () => {
    const route = new Route(resolveFixture('basic'));
    const routes = sortByPath(await route.getRoutes());

    expect(routes.length).toBe(3);
    expect(routes[0]).toMatchObject({
      exact: true,
      path: '/'
    });
    expect(routes[0].component).toMatch(/index.js$/);
    expect(routes[1]).toMatchObject({
      exact: true,
      path: '/a'
    });
    expect(routes[1].component).toMatch(/a.js$/);
    expect(routes[2]).toMatchObject({
      exact: true,
      path: '/snake-case'
    });
    expect(routes[2].component).toMatch(/snake-case.js$/);
  });

  test('should work for nested dir', async () => {
    const route = new Route(resolveFixture('nest'));
    const routes = sortByPath(await route.getRoutes());

    expect(routes.length).toBe(3);
    expect(routes[0]).toMatchObject({
      exact: true,
      path: '/'
    });
    expect(routes[0].component).toMatch(/index.js$/);
    expect(routes[1]).toMatchObject({
      exact: true,
      path: '/sub'
    });
    expect(routes[1].component).toMatch(/sub\/index.js$/);
    expect(routes[2]).toMatchObject({
      exact: true,
      path: '/sub/a'
    });
    expect(routes[2].component).toMatch(/sub\/a.js$$/);
  });

  test('should generate layout route', async () => {
    const route = new Route(resolveFixture('layout'));
    const routes = sortByPath(await route.getRoutes());

    expect(routes.length).toBe(2);
    expect(routes[0]).toMatchObject({
      exact: true,
      path: '/'
    });
    expect(routes[0].component).toMatch(/index.js$/);
    expect(routes[1]).toMatchObject({
      exact: false,
      path: '/b'
    });
    expect(routes[1].component).toMatch(/b\/_layout.js$/);

    const b = routes[1];
    expect(b.routes.length).toBe(3);
    expect(b.routes[0]).toMatchObject({
      exact: true,
      path: '/b'
    });
    expect(b.routes[0].component).toMatch(/b\/index.js$/);
    expect(b.routes[1]).toMatchObject({
      exact: true,
      path: '/b/b_1'
    });
    expect(b.routes[1].component).toMatch(/b\/b_1.js$/);
    expect(b.routes[2]).toMatchObject({
      exact: false,
      path: '/b/c'
    });
    expect(b.routes[2].component).toMatch(/b\/c\/_layout.js$/);

    const c = b.routes[2];
    expect(c.routes.length).toBe(1);
    expect(c.routes[0]).toMatchObject({
      exact: true,
      path: '/b/c'
    });
    expect(c.routes[0].component).toMatch(/b\/c\/index.js$/);
  });
});
