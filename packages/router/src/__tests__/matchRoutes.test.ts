import { matchRoutes } from '../matchRoutes';
import { DUMMY_ELEMENT } from './utils';

const ROUTE1 = {
  path: '/',
  caseSensitive: true,
  element: DUMMY_ELEMENT
};

const ROUTE2 = {
  path: '/test',
  caseSensitive: true,
  element: DUMMY_ELEMENT
};

const ROUTE3 = {
  path: '/:id/nested',
  caseSensitive: true,
  element: DUMMY_ELEMENT,
  children: [{ path: '/asd', caseSensitive: true, element: DUMMY_ELEMENT }]
};

describe('matchRoutes', () => {
  it('should match with 1 route', () => {
    expect(matchRoutes([ROUTE1, ROUTE2], '/')).toStrictEqual([
      {
        params: {},
        pathname: '/',
        route: {
          caseSensitive: true,
          element: DUMMY_ELEMENT,
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
          element: DUMMY_ELEMENT,
          path: '/:id/nested',
          children: [
            { path: '/asd', caseSensitive: true, element: DUMMY_ELEMENT }
          ]
        }
      },
      {
        params: {
          id: '123'
        },
        pathname: '/123/nested/asd',
        route: {
          path: '/asd',
          caseSensitive: true,
          element: DUMMY_ELEMENT
        }
      }
    ]);
  });
});
