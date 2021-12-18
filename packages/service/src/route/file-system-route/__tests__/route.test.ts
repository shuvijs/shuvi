import { resolveFixture, sortByPath } from './utils';
import { getRoutes } from '../fileSystemRoute';

describe('route', () => {
  test('should work', async () => {
    const routes = sortByPath(
      await getRoutes({
        dir: resolveFixture('basic'),
        ignoreLayout: false
      })
    );

    expect(routes).toMatchObject([
      {
        path: '/',
        filepath: resolveFixture('basic/index.js')
      },
      {
        path: '/a',
        filepath: resolveFixture('basic/a.js')
      },
      {
        path: '/snake-case',
        filepath: resolveFixture('basic/snake-case.js')
      }
    ]);
  });

  test('should work for nested dir', async () => {
    const routes = sortByPath(
      await getRoutes({
        dir: resolveFixture('nest'),
        ignoreLayout: false
      })
    );

    expect(routes).toMatchObject([
      {
        path: '/',
        filepath: resolveFixture('nest/index.js')
      },
      {
        path: '/sub',
        children: [
          {
            path: '/a',
            filepath: resolveFixture('nest/sub/a.js')
          },
          {
            path: '/',
            filepath: resolveFixture('nest/sub/index.js')
          }
        ]
      }
    ]);
  });

  test('should generate layout route with false', async () => {
    const routes = sortByPath(
      await getRoutes({
        dir: resolveFixture('layout'),
        ignoreLayout: false
      })
    );

    expect(routes).toMatchObject([
      {
        path: '/',
        filepath: resolveFixture('layout/index.js')
      },
      {
        path: '/b',
        filepath: resolveFixture('layout/b/_layout.js'),
        children: [
          {
            path: '/b_1',
            filepath: resolveFixture('layout/b/b_1.js')
          },
          {
            path: '/c',
            filepath: resolveFixture('layout/b/c/_layout.js'),
            children: [
              {
                path: '/',
                filepath: resolveFixture('layout/b/c/index.js')
              }
            ]
          },
          {
            path: '/',
            filepath: resolveFixture('layout/b/index.js')
          }
        ]
      }
    ]);
  });
  test('should generate layout route with ignoreLayout true', async () => {
    const routes = sortByPath(
      await getRoutes({
        dir: resolveFixture('layout'),
        ignoreLayout: true
      })
    );

    expect(routes).toMatchObject([
      {
        path: '/',
        filepath: resolveFixture('layout/index.js')
      },
      {
        path: '/_layout',
        filepath: resolveFixture('layout/_layout.js')
      },
      {
        path: '/b',
        children: [
          {
            path: '/_layout',
            filepath: resolveFixture('layout/b/_layout.js')
          },
          {
            path: '/b_1',
            filepath: resolveFixture('layout/b/b_1.js')
          },
          {
            path: '/c',
            children: [
              {
                path: '/_layout',
                filepath: resolveFixture('layout/b/c/_layout.js')
              },
              {
                path: '/',
                filepath: resolveFixture('layout/b/c/index.js')
              }
            ]
          },
          {
            path: '/',
            filepath: resolveFixture('layout/b/index.js')
          }
        ]
      }
    ]);
  });
});
