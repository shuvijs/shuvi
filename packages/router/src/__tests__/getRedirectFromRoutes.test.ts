import { getRedirectFromRoutes } from '../getRedirectFromRoutes';

describe('getRedirectFromRoutes', () => {
  it('should return string', () => {
    expect(
      getRedirectFromRoutes([
        {
          pathname: '/about',
          params: {},
          route: {
            path: '/about',
            redirect: '/'
          }
        }
      ])
    ).toBe('/');
  });

  it('should return the last redirect', () => {
    expect(
      getRedirectFromRoutes([
        {
          pathname: '/about',
          params: {},
          route: {
            path: '/about',
            redirect: '/incorrect'
          }
        },
        {
          pathname: '/about/me',
          params: {},
          route: {
            path: 'me',
            redirect: '/correct'
          }
        }
      ])
    ).toBe('/correct');
  });

  it('should return null', () => {
    expect(
      getRedirectFromRoutes([
        {
          pathname: '/about',
          params: {},
          route: {
            path: '/about'
          }
        }
      ])
    ).toBe(null);
  });
});
