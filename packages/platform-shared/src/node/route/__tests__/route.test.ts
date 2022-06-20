import { resolveFixture, sortByPath } from './utils';
import { getRoutesFromFiles } from '../route';
import { recursiveReadDirSync } from '@shuvi/utils/lib/recursiveReaddir';

const getRoutes = (dir: string, ignoreLayout?: boolean) => {
  const files = recursiveReadDirSync(dir, { rootDir: '' });
  return getRoutesFromFiles(files, dir, ignoreLayout);
};

describe('route', () => {
  test('should work', async () => {
    const routes = sortByPath(getRoutes(resolveFixture('basic'), false));

    expect(routes).toMatchObject([
      {
        path: '/',
        component: resolveFixture('basic/index.js')
      },
      {
        path: '/a',
        component: resolveFixture('basic/a.js')
      },
      {
        path: '/snake-case',
        component: resolveFixture('basic/snake-case.js')
      }
    ]);
  });

  test('should work for nested dir', async () => {
    const routes = sortByPath(getRoutes(resolveFixture('nest'), false));

    expect(routes).toMatchObject([
      {
        path: '/',
        component: resolveFixture('nest/index.js')
      },
      {
        path: '/sub',
        children: [
          {
            path: '/a',
            component: resolveFixture('nest/sub/a.js')
          },
          {
            path: '/',
            component: resolveFixture('nest/sub/index.js')
          }
        ]
      }
    ]);
  });

  test('should generate layout route with false', async () => {
    const routes = sortByPath(getRoutes(resolveFixture('layout'), false));

    expect(routes).toMatchObject([
      {
        path: '/',
        component: resolveFixture('layout/index.js')
      },
      {
        path: '/b',
        component: resolveFixture('layout/b/_layout.js'),
        children: [
          {
            path: '/b_1',
            component: resolveFixture('layout/b/b_1.js')
          },
          {
            path: '/c',
            component: resolveFixture('layout/b/c/_layout.js'),
            children: [
              {
                path: '/',
                component: resolveFixture('layout/b/c/index.js')
              }
            ]
          },
          {
            path: '/',
            component: resolveFixture('layout/b/index.js')
          }
        ]
      }
    ]);
  });
  test('should generate layout route with true', async () => {
    const routes = sortByPath(getRoutes(resolveFixture('layout'), true));

    expect(routes).toMatchObject([
      {
        path: '/',
        component: resolveFixture('layout/index.js')
      },
      {
        path: '/_layout',
        component: resolveFixture('layout/_layout.js')
      },
      {
        path: '/b',
        children: [
          {
            path: '/_layout',
            component: resolveFixture('layout/b/_layout.js')
          },
          {
            path: '/b_1',
            component: resolveFixture('layout/b/b_1.js')
          },
          {
            path: '/c',
            children: [
              {
                path: '/_layout',
                component: resolveFixture('layout/b/c/_layout.js')
              },
              {
                path: '/',
                component: resolveFixture('layout/b/c/index.js')
              }
            ]
          },
          {
            path: '/',
            component: resolveFixture('layout/b/index.js')
          }
        ]
      }
    ]);
  });
  // rename之后已经不是正确的case了
  // test('should generate middleware route', async () => {
  //   const routes = sortByPath(getRoutes(resolveFixture('middleware')));
  //   console.log(routes);
  //   expect(routes).toMatchObject([
  //     {
  //       path: '/',
  //       component: resolveFixture('middleware/index.js'),
  //       middlewares: [resolveFixture('middleware/_middleware.js')]
  //     },
  //     {
  //       path: '/b',
  //       children: [
  //         {
  //           path: '/c',
  //           children: [
  //             {
  //               path: '/',
  //               component: resolveFixture('middleware/b/c/index.js')
  //             }
  //           ]
  //         },
  //         {
  //           path: '/',
  //           component: resolveFixture('middleware/b/index.js'),
  //           middlewares: [
  //             resolveFixture('middleware/_middleware.js'),
  //             resolveFixture('middleware/b/_middleware.ts')
  //           ]
  //         }
  //       ]
  //     }
  //   ]);
  // });
});
