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

  it('should match with 1 route with querystring', () => {
    expect(matchRoutes([ROUTE1, ROUTE2], '/?test=123')).toStrictEqual([
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

describe('path matching', () => {
  function pickPaths(routes: any, pathname: any) {
    let matches = matchRoutes(routes, { pathname });
    return matches ? matches.map(match => match.route.path) : null;
  }

  test('root vs. dynamic', () => {
    let routes = [{ path: '/' }, { path: ':id' }];
    expect(pickPaths(routes, '/')).toEqual(['/']);
    expect(pickPaths(routes, '/123')).toEqual([':id']);
  });

  test('precedence of a bunch of routes in a flat route config', () => {
    let routes = [
      { path: '/groups/main/users/me' },
      { path: '/groups/:groupId/users/me' },
      { path: '/groups/:groupId/users/:userId' },
      { path: '/groups/:groupId/users/:_other(.*)' },
      { path: '/groups/main/users' },
      { path: '/groups/:groupId/users' },
      { path: '/groups/main' },
      { path: '/groups/:groupId' },
      { path: '/groups' },
      { path: '/files/:_other(.*)' },
      { path: '/files' },
      { path: '/:one/:two/:three/:four/:five' },
      { path: '/' },
      { path: '/:_other(.*)' }
    ];

    expect(pickPaths(routes, '/groups/main/users/me')).toEqual([
      '/groups/main/users/me'
    ]);
    expect(pickPaths(routes, '/groups/other/users/me')).toEqual([
      '/groups/:groupId/users/me'
    ]);
    expect(pickPaths(routes, '/groups/123/users/456')).toEqual([
      '/groups/:groupId/users/:userId'
    ]);
    expect(pickPaths(routes, '/groups/main/users/a/b')).toEqual([
      '/groups/:groupId/users/:_other(.*)'
    ]);
    expect(pickPaths(routes, '/groups/main/users')).toEqual([
      '/groups/main/users'
    ]);
    expect(pickPaths(routes, '/groups/123/users')).toEqual([
      '/groups/:groupId/users'
    ]);
    expect(pickPaths(routes, '/groups/main')).toEqual(['/groups/main']);
    expect(pickPaths(routes, '/groups/123')).toEqual(['/groups/:groupId']);
    expect(pickPaths(routes, '/groups')).toEqual(['/groups']);
    expect(pickPaths(routes, '/files/some/long/path')).toEqual([
      '/files/:_other(.*)'
    ]);
    expect(pickPaths(routes, '/files')).toEqual(['/files']);
    expect(pickPaths(routes, '/one/two/three/four/five')).toEqual([
      '/:one/:two/:three/:four/:five'
    ]);
    expect(pickPaths(routes, '/')).toEqual(['/']);
    expect(pickPaths(routes, '/no/where')).toEqual(['/:_other(.*)']);
  });

  test('precedence of a bunch of routes in a nested route config', () => {
    let routes = [
      {
        path: 'courses',
        children: [
          {
            path: ':id',
            children: [{ path: 'subjects' }]
          },
          { path: 'new' },
          { path: '/' },
          { path: '*' }
        ]
      },
      {
        path: 'courses',
        children: [
          { path: 'react-fundamentals' },
          { path: 'advanced-react' },
          { path: '*' }
        ]
      },
      { path: '/' },
      { path: '*' }
    ];

    expect(pickPaths(routes, '/courses')).toEqual(['courses', '/']);
    expect(pickPaths(routes, '/courses/routing')).toEqual(['courses', ':id']);
    expect(pickPaths(routes, '/courses/routing/subjects')).toEqual([
      'courses',
      ':id',
      'subjects'
    ]);
    expect(pickPaths(routes, '/courses/new')).toEqual(['courses', 'new']);
    expect(pickPaths(routes, '/courses/whatever/path')).toEqual([
      'courses',
      '*'
    ]);
    expect(pickPaths(routes, '/courses/react-fundamentals')).toEqual([
      'courses',
      'react-fundamentals'
    ]);
    expect(pickPaths(routes, '/courses/advanced-react')).toEqual([
      'courses',
      'advanced-react'
    ]);
    expect(pickPaths(routes, '/')).toEqual(['/']);
    expect(pickPaths(routes, '/whatever')).toEqual(['*']);
  });

  test('nested index route vs sibling static route', () => {
    let routes = [
      {
        path: ':page',
        children: [{ path: '/' }]
      },
      { path: 'page' }
    ];

    expect(pickPaths(routes, '/page')).toEqual(['page']);
  });
});

describe('path matching with a basename', () => {
  let routes = [
    {
      path: '/users/:userId',
      children: [
        {
          path: 'subjects',
          children: [
            {
              path: ':courseId'
            }
          ]
        }
      ]
    }
  ];

  test('top-level route', () => {
    let location = { pathname: '/app/users/michael' };
    let matches = matchRoutes(routes, location, '/app');

    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([
      {
        pathname: '/users/michael',
        params: { userId: 'michael' }
      }
    ]);
  });

  test('deeply nested route', () => {
    let location = { pathname: '/app/users/michael/subjects/react' };
    let matches = matchRoutes(routes, location, '/app');

    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(3);
    expect(matches).toMatchObject([
      {
        pathname: '/users/michael',
        params: { userId: 'michael' }
      },
      {
        pathname: '/users/michael/subjects',
        params: { userId: 'michael' }
      },
      {
        pathname: '/users/michael/subjects/react',
        params: { userId: 'michael', courseId: 'react' }
      }
    ]);
  });
});
