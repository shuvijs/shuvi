import { resolveFixture, sortByPath } from './utils';
import { Route } from '../route';

describe('route', () => {
  test('should work', async () => {
    const route = new Route(resolveFixture('basic'));
    const routes = sortByPath(await route.getRoutes());

    expect(routes.length).toBe(3);
    expect(routes[0]).toMatchObject({
      path: '/'
    });
    expect(routes[0].component).toMatch(/index.js$/);
    expect(routes[1]).toMatchObject({
      path: '/a'
    });
    expect(routes[1].component).toMatch(/a.js$/);
    expect(routes[2]).toMatchObject({
      path: '/snake-case'
    });
    expect(routes[2].component).toMatch(/snake-case.js$/);
  });

  test('should work for nested dir', async () => {
    const route = new Route(resolveFixture('nest'));
    const routes = sortByPath(await route.getRoutes());

    expect(routes.length).toBe(2);
    expect(routes[0]).toMatchObject({
      path: '/'
    });
    expect(routes[0].component).toMatch(/index.js$/);
    expect(routes[1]).toMatchObject({
      path: '/sub'
    });
    expect(routes[1].component).toBeUndefined();
    const subRoutes = routes[1].children;
    expect(subRoutes[0]).toMatchObject({
      path: '/a'
    });
    expect(subRoutes[0].component).toMatch(/sub\/a.js$/);

    expect(subRoutes[1]).toMatchObject({
      path: '/'
    });
    expect(subRoutes[1].component).toMatch(/sub\/index.js$/);
  });

  test('should generate layout route', async () => {
    const route = new Route(resolveFixture('layout'));
    const routes = sortByPath(await route.getRoutes());

    expect(routes.length).toBe(2);
    expect(routes[0]).toMatchObject({
      path: '/'
    });
    expect(routes[0].component).toMatch(/index.js$/);
    expect(routes[1]).toMatchObject({
      path: '/b'
    });
    expect(routes[1].component).toMatch(/b\/_layout.js$/);

    const b = routes[1];
    expect(b.children.length).toBe(3);

    const [b1, c, bIndex] = b.children;
    expect(b1).toMatchObject({
      path: '/b_1'
    });
    expect(b1.component).toMatch(/b\/b_1.js$/);
    expect(bIndex).toMatchObject({
      path: '/'
    });
    expect(bIndex.component).toMatch(/b\/index.js$/);

    expect(c).toMatchObject({
      path: '/c'
    });
    expect(c.component).toMatch(/b\/c\/_layout.js$/);

    const [cIndex] = c.children;

    expect(cIndex).toMatchObject({
      path: '/'
    });
    expect(cIndex.component).toMatch(/b\/c\/index.js$/);
  });
});
