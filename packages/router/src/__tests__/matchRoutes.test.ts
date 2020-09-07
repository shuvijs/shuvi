import { matchRoutes } from '../matchRoutes';

const ROUTE1 = {
  path: '/',
  caseSensitive: true
};

const ROUTE2 = {
  path: '/test',
  caseSensitive: true
};

const ROUTE3 = {
  path: '/:id/nested',
  caseSensitive: true,
  children: [{ path: '/asd', caseSensitive: true }]
};

describe('matchRoutes', () => {
  it('should match with 1 route', () => {
    expect(matchRoutes([ROUTE1, ROUTE2], '/')).toStrictEqual([
      {
        params: {},
        pathname: '/',
        route: {
          caseSensitive: true,
          path: '/'
        }
      }
    ]);
  });

  it('should match with multiple routes', () => {
    expect(
      matchRoutes([ROUTE1, ROUTE2, ROUTE3], '/123/nested/asd')
    ).toStrictEqual([
      {
        params: {
          id: '123'
        },
        pathname: '/123/nested',
        route: {
          caseSensitive: true,
          path: '/:id/nested',
          children: [{ path: '/asd', caseSensitive: true }]
        }
      },
      {
        params: {
          id: '123'
        },
        pathname: '/123/nested/asd',
        route: {
          path: '/asd',
          caseSensitive: true
        }
      }
    ]);
  });
});
